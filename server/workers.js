const os = require('os')
const { Cluster } = require('puppeteer-cluster');
const aws = require('./aws');
const tunnel = require('tunnel-ssh');
const fs = require('fs');

const workers = [];
const metadata = {};
let local_ssh_port_iter = 20000;

async function init_tunnel_cluster(name, ip, tabs, timeout) {
  var browserURL = `http://localhost:${local_ssh_port_iter}/`

  var config = {
    username: 'ubuntu',
    privateKey: fs.readFileSync('/root/.ssh/dev-vm'),
    host: ip,
    port: 22,
    localPort: local_ssh_port_iter,
    dstHost: 'localhost',
    dstPort: 9222,
  };

  var server = tunnel(config, async function (error, server) {
    //console.log("tunnel server: ", server);
    let puppeteer_cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_REMOTE_PAGE,
      maxConcurrency: tabs,
      puppeteerOptions: {
        headless: true,
        ignoreHTTPSErrors: true,
        browserURL: browserURL,
      },
      timeout: timeout
    })

    workers[workers.length] = puppeteer_cluster;

    metadata[workers.length-1] = {
      id: workers.length-1,
      name: name,
      url: browserURL,
      total_tabs: tabs,
      timeout: timeout,
      queued: 0
    }

    local_ssh_port_iter++;
    success = true
  });

  server.on('error', async function(err) {
    console.log("tunnel failed: ", err);
    console.log("server?: ", server);
    //await init_tunnel_cluster(name, ip, tabs, timeout);
  });
}

//init_tunnel_cluster("fake", "127.9.2.1", 1, 10000);

// throws exception on fail
async function init_remote_cluster(name, browserURL, tabs, timeout) {
  let puppeteer_cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_REMOTE_PAGE,
    maxConcurrency: tabs,
    puppeteerOptions: {
      headless: true,
      ignoreHTTPSErrors: true,
      browserURL: browserURL,
    },
    //monitor: true,
    timeout: timeout
  })

  workers[workers.length] = puppeteer_cluster;

  metadata[workers.length-1] = {
    id: workers.length-1,
    name: name,
    url: browserURL,
    total_tabs: tabs,
    timeout: timeout,
    queued: 0
  }
}

// todo on app start: load workers from db, initiate clusters, populate worker array
async function load_clusters() {

}

async function init_cluster() {
  const tabs = os.cpus().length * 2;

  let puppeteer_cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: tabs,
    puppeteerOptions: {
      headless: true,
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox',
        '--mute-audio',
        '--disable-setuid-sandbox',
        '--user-data-dir=/tmp',
        '--disable-gpu',
        '--disable-crash-reporter',
        '--no-first-run',
        '--disable-client-side-phishing-detection',
        '--disable-background-networking',
        '--window-size=1366,768',
        '--disable-dev-shm-usage',
      ]
    },
    //monitor: true,
    timeout: 10000
  });

  workers[0] = puppeteer_cluster;

  metadata[0] = {
    id: 0,
    name: "local",
    url: "<local>",
    total_tabs: tabs,
    queued: 0
  }
}

//routes
async function add(req, res) {
  var name = req.body.worker_name;
  var url = req.body.worker_url;
  var tabs = parseInt(req.body.worker_tabs);

  try {
    await init_remote_cluster(name, url, tabs, 10000);
    res.status(200).json({success: true, workers: workers.metadata});
  }  catch (err) {
    console.log("error adding worker: ", err);
    res.status(200).json({success: false, error: err.toString()});
  }
}

async function create_ec2(req, res) {
  //var name = req.body.worker_name;
  //var ec2_type = req.body.ec2_type;
  //var num_instances = req.body.ec2_instance_count; //danger
  var name = "test-ec2";
  var ec2_type = "t2.micro";
  var num_instances = 1;

  var instance_data = await aws.create_instances("ami-00ddb0e5626798373", ec2_type, num_instances);
  //console.log("got instance data: ", instance_data);

  //init_tunnel_cluster(name, '107.21.40.125', 2, 10000);

  try {
    for (instance of instance_data.instances) {
      console.log("adding tunneled cluster: ", instance);
      await init_tunnel_cluster(instance["id"], instance["public_ip"], instance["tabs"], 10000);
    }
    res.status(200).json({success: true, workers: metadata});
  }  catch (err) {
    console.log("error adding worker: ", err);
    res.status(200).json({success: false, error: err.toString()});
  }
}

async function list(req, res) {
  res.status(200).json({success: true, workers: metadata});
}

module.exports = {
  workers,
  metadata,
  init_remote_cluster,
  init_cluster,
  job_id_inc: 0, // just an iterator to keep track of jobs

  // rest functions
  add,
  create_ec2,
  list
}