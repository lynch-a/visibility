const os = require('os');
const { Cluster } = require('puppeteer-cluster');
const { ArgumentParser } = require('argparse');
const fs = require('fs');
const ini = require('ini');
const { spawn } = require("child_process");

// our stuff
const screenshot = require('./screenshot');
const workers = require('./workers');
const utils = require('./utils');

// parse command line args
const parser = new ArgumentParser({
  description: 'Take web screenshots quickly.',
  add_help: true
});
parser.add_argument('-f', '--file', {default: "config.ini", help: "ini config file to use"});
var args = parser.parse_args();

// parse ini args
var config = ini.parse(fs.readFileSync(args.file, 'utf-8'));

var input_file = config.target.file;
var http_ports = utils.parsePorts(config.target.http_ports);
var https_ports = utils.parsePorts(config.target.https_ports);
var no_images = config.options.dont_request_images || false;
var no_scripts = config.options.dont_request_scripts || false;
var use_local_worker = config.workers.use_local || true;
var use_remote_workers = config.workers.use_remote_workers || false;
var remote_worker_ssh_key = config.workers.remote_worker_ssh_key || "~/.ssh/id_rsa"
var local_worker_tabs = config.workers.local_worker_tabs || os.cpus().length * 2;

// parse targets and queue work
(async () => {
  if (use_local_worker) {
    await workers.init_local_cluster(local_worker_tabs);
  }

// workers[] = test-ssh|ssh|root@localhost:40022|4|10000


  var worker_port = 40000;
  if (use_remote_workers) {
    if (config.workers.workers) {
      for(worker of config.workers.workers) {
        var split = worker.split('|');
        var name = split[0];
        var method = split[1].toLowerCase();
        var url = split[2];
        var tabs = parseInt(split[3]);
        var timeout = parseInt(split[4]);

        if (method == "ssh") {
          // connect to the ssh server specified
          var username = null;
          var host = null;
          var port = 22;

          var split2 = url.split("@");
          username = split2[0];
          host = split2[1];
          
          if (host.includes(":")) {
            var split3 = host.split(":");
            host = split3[0];
            port = split3[1];
          }

          var tunnel = await spawn('ssh', ['-qtt', '-L', `${worker_port}:localhost:9222`, `${username}@${host}`, '-p', `${port}`, '-i', `${remote_worker_ssh_key}`]);
          await workers.init_remote_cluster(name, "http://localhost:"+worker_port, tabs, timeout);
          worker_port++;
        } else if (method == "http") {
          await workers.init_remote_cluster(name, url, tabs, timeout);
        } else {
          console.log("Invalid remote worker connection method specified in configuration file for worker " + name + ": ", method);
          process.exit(1);
        }
      }
    }
  }

  var targets = [];

  const input = fs.readFileSync(input_file).toString();
  const lines = input.split('\n');
  for (let i = 0; i < lines.length; i++) {
    targets.push(lines[i]);
  }

  var work =  {
    options: {
      http_ports: http_ports,
      https_ports: https_ports
    },
    targets: targets
  }

  screenshot.queue_screenshots(work);

  for (worker of workers.workers) {
    await worker.idle();
    await worker.close();
  }
})();