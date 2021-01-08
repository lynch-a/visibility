// load the SDK for JavaScript
const AWS = require('aws-sdk');
const fs = require('fs')

AWS.config.loadFromPath('./aws-config.json');
AWS.config.update({region:'us-east-1'});
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});
const ssh_pubkey = fs.readFileSync('ssh-pubkey.pub', 'utf8');

let install_and_start_chromium = `#!/bin/bash
sudo apt-get update
sudo apt-get install -y chromium-browser
printf "${ssh_pubkey}" >> /home/ubuntu/.ssh/authorized_keys
chromium-browser --headless --no-sandbox --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --user-data-dir=/tmp`;

async function create_instances(ami, type, count) {
  let sg_id = await create_or_return_sg();

  const create_instance_params = {
    ImageId: ami, // make sure AMI is available in region
    InstanceType: type,
    KeyName: 'Macbook', // (remove this) no access until the userdata script runs
    MinCount: count,
    MaxCount: count,
    UserData: Buffer.from(install_and_start_chromium).toString('base64'),
    SecurityGroupIds: [
      sg_id
    ]
  }

  try {
    var data = await ec2.runInstances(create_instance_params).promise();
    
    var created_instances = {
      instances: [
      /*{
          id: "i-123123123,
          public_ip: "127.0.0.1",
          cores: 4
        }
      */
      ]
    };

    for(let instance of data["Instances"]) {
      let ip = null;

      while (true) { // wait for ec2 public ip; prob set a timeout on this lol
        try {
          //console.log("spinning and waiting for ec2 public ip on : ", instance["InstanceId"]);
          let describe_instance_params = {
            InstanceIds: [
              instance["InstanceId"]
            ]
          }
          var description = await ec2.describeInstances(describe_instance_params).promise();

          ip = description["Reservations"][0]["Instances"][0]["NetworkInterfaces"][0]["Association"]["PublicIp"];
          
          if (ip) {
            break;
          }
        } catch (err) {
          // todo, check to make sure this is erroring because the ip isn't ready yet
          //console.log("error getting public IP: ", err);
        }
      }

      var cpu_count = parseInt(instance["CpuOptions"]["CoreCount"]);
      var thread_per_cpu = parseInt(instance["CpuOptions"]["ThreadsPerCore"]);

      created_instances.instances.push(
        {
          id: instance["InstanceId"],
          public_ip: ip,
          tabs: (cpu_count * thread_per_cpu)*2
        }
      );
    }
  } catch (err) {
    console.log("something went wrong creating ec2 instance: ", err);
  }

  return created_instances;
}

async function create_sg() {
  try {
    var paramsSecurityGroup = {
      Description: "Visibility security group - ssh/22 only",
      GroupName: "visibility-worker",
    };

    /* greetz/thx: opticalza */
    var data = await ec2.createSecurityGroup(paramsSecurityGroup).promise();

    var SecurityGroupId = data.GroupId;

    var paramsIngress = {
      GroupId: data["GroupId"],
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: 22,
          ToPort: 22,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }],
        },
      ],
    };

    var paramsEgress = {
      GroupId: data["GroupId"],
      IpPermissions: [
        {
          IpProtocol: "tcp",
          FromPort: 22,
          ToPort: 22,
          IpRanges: [{ CidrIp: "0.0.0.0/0" }],
        },
      ],
    };

    await ec2.authorizeSecurityGroupIngress(paramsIngress).promise();
    await ec2.authorizeSecurityGroupEgress(paramsEgress).promise();

  } catch (err) {
    console.log(`idk something went wrong setting security group: ${err}`);
  }

  return SecurityGroupId;
}

// returns the GroupId of created sg if it didn't exist or existing sg
async function create_or_return_sg() {
  try {
    var sg_params = {
      GroupNames: ["visibility-worker"]
    };

    var data = await ec2.describeSecurityGroups(sg_params).promise();
    return data.SecurityGroups[0]["GroupId"];

  } catch (err) {
    if (err.name == "InvalidGroup.NotFound") {
      // security group didn't exist, make it first
      return await create_sg();
    } else {
      console.log("error getting SG details: ", err);
    } 
  }
}

//create_instances("ami-00ddb0e5626798373", "t2.micro", 1).then( data => {
//  console.log("instances result: ", data);
//})


module.exports = {
  create_instances
}

// ssh -L 20000:127.0.0.1:9222 ubuntu@18.234.34.66 -i ~/.ssh/dev-vm