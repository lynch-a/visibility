const express = require("express");
const Http = require("http").Server(express());
const Socketio = require("socket.io")(Http);
const { Cluster } = require('puppeteer-cluster');
const fs = require('fs');
var sqlite3 = require('sqlite3').verbose()
const url = require('url');
const utils = require('./utils');
const sequelize = require('./db');
const { models } = sequelize;
const cors = require('cors');
const os = require('os')

const app = express();
app.use(cors());

/*
  worker looks like:
  
  1: {
    id: worker_index,
    name: name,
    url: browserURL,
    total_tabs: os.cpus().length * 2, // 2 tabs per core seems ok
    puppeteer_cluster: puppeteer_cluster,
    queued: 0
  }

  2: {
    ...
  }
*/

let workers = [];
let worker_meta = {};

let worker_index = 0;

let job_id_inc = 0;

app.use(express.json({limit: '10mb'}));


async function do_ss({ page, data: data}) {
  console.time(`total-ss-time-${data["worker_id"]}-${data["job_id"]}`);
  try {
    //console.log("visiting website");
    //console.time(`ss-time-${data["job_id"]}`);
    var response = await page.goto(data["url"], { waitUntil: 'domcontentloaded' });
    //console.log("version: ", await page.browser().version());

    //var file_name = url.replace("://", "-").replace(".", "-").replace(":", "-");
    //console.log("visited website");

    var b64 = await page.screenshot(
      {
        encoding: "base64",
        type: "jpeg",
        //fullPage: true
        //path: `screenshots/${file_name}.png`,
      }
    );
    //console.timeEnd(`ss-time-${data["job_id"]}`);

    //console.log("got ss");
    var {host, protocol, port} = utils.getParsedUrl(data["url"]);
    var pageTitle = await page.evaluate(() => document.title);
    //var responseCode = parseInt(response['_status']);
    var responseCode = 200;
    //var ip = response._remoteAddress['ip']; //unused
    var headers = response._headers;
    //console.log(headers);

    const webpage_data = {
      protocol: protocol,
      host: host,
      port: data["port"]
    };

    const snapshot_data = {
      page_title: pageTitle,
      status_code: responseCode,
      headers: headers,
      image: `data:image/jpeg;base64,${b64}`
    };

    //console.log("trying to add to db");
    //console.time(`db-time-${data["job_id"]}`);

    try {
      models.webpage.findOne(
        {
          where: webpage_data
        }
      ).then(async function (db_webpage) {
        var db_snapshot = null;
        if (!db_webpage) {
          db_webpage = await models.webpage.create(webpage_data);
          db_snapshot = await db_webpage.createSnapshot(snapshot_data)
        } else {
          db_snapshot = await db_webpage.createSnapshot(snapshot_data);
        }
        //console.log(`Screenshot taken: ${data["url"]}`);
      });
    } catch (err) {
      console.log("error in database save:", err);
    }
    //console.timeEnd(`db-time-${data["job_id"]}`);

  } catch (err) {
    console.log("BIG PROBLEM: ", err);
    console.log("failed on: ", data["url"]);
  } finally {
    worker_meta[data["worker_id"]].queued--;

    Socketio.sockets.emit('worker-update', {
      worker_id: data["worker_id"],
      worker: worker_meta[data["worker_id"]]
    });

  }
  console.timeEnd(`total-ss-time-${data["worker_id"]}-${data["job_id"]}`);
}

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

  workers[worker_index] = puppeteer_cluster;

  worker_meta[worker_index] = {
    id: worker_index,
    name: name,
    url: browserURL,
    total_tabs: tabs,
    queued: 0
  }

  worker_index++;
}


async function init_cluster() {
  let puppeteer_cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: os.cpus().length * 2,
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

  workers[worker_index] = puppeteer_cluster;

  worker_meta[worker_index] = {
    id: worker_index,
    name: "local",
    url: "<local>",
    total_tabs: os.cpus().length * 2, // 2 tabs per core seems ok
    queued: 0
  }

  worker_index++;
}

async function init_ws() {
  Http.listen(3001, () => {
    console.log("WS Listening :3001");
  });

  Socketio.on("connection", socket => {
    socket.emit('{"working": true}');
    console.log("Received connection");
  });
}

async function init_express() {
  app.listen(3000, function () {
      console.log('Screenshot server listening on port 3000.');
  });

  app.post('/scan/screenshots', async function (req, res) {
      if (!req.body.targets) {
        return res.end('No targets in POST body detected - 1');
      }

      if (req.body.targets.length < 1) {
        return res.end('No targets in POST body detected - 2');
      }

      if (!req.body.options) {
        return res.end('No options in POST body detected - 1');
      } else {
        var http_ports = (req.body.options.http_ports || []).filter(port => {
          return port != ""
        });

        var https_ports = (req.body.options.https_ports || []).filter(port => {
          return port != ""
        });

        var request_images = req.body.options.scripts || true;
        var request_scripts = req.body.options.images || true;
      }

      //try {

        var queue = [];

        for (let target of req.body.targets) {
          for (let http_port of http_ports) {
            let screenshot_options = {
              "job_id": job_id_inc,
              //"url": `http://${target}:${http_port}`,
              "url": `http://${target}:${https_port}`,
              "port": parseInt(http_port),
              "images": request_images,
              "scripts": request_scripts
            }

            queue.push(screenshot_options);

            job_id_inc++;
          }

          for (let https_port of https_ports) {
            let screenshot_options = {
              "job_id": job_id_inc,
              "url": `https://${target}:${https_port}`,
              "port": parseInt(https_port),
              "images": request_images,
              "scripts": request_scripts
            }

            queue.push(screenshot_options);
            job_id_inc++;
          }
        }

        // distribute the queued jobs based on how many tabs each worker has available
        if (workers.length > 0) {
          queue_loop: while (queue.length > 0) {
            for(let [index, worker] of workers.entries()) {
              for(var i = 0; i < worker_meta[index]["total_tabs"]; i++) {
                var temp_job = queue.shift();

                // add worker id to job
                temp_job.worker_id = index;

                worker.queue(temp_job, do_ss);

                worker_meta[index].queued++

                if (queue.length == 0) {
                  break queue_loop;
                }
              }
            }
          }
        }

        res.status(200).json({"success": true, workers: worker_meta});
        //res.end('{ "success": true }');
      //} catch (err) {
      //  res.end('Error: ' + err.message);
      //}
  });


  app.get('/webpages', async function (req, res) {
    var webpages = null;

    if (req.query.page && req.query.perpage) {
      // do pagination
      var page = req.query.page-1;
      var perpage = req.query.perpage;
      console.log("page: ", page);
      console.log("perpage: ", perpage);

      webpages = await models.webpage.findAll({
        attributes: ['id', 'host', 'port', 'protocol', [sequelize.fn('count', 'snapshot.id'), 'snapshot_count']],
        group: ['webpage.id'],
        include: [{
          model: models.snapshot,
          require: true
        }],
        offset: page * perpage,
        limit: perpage
      });

    }  else {
      // do no pagination
      webpages = await models.webpage.findAll({
        attributes: ['id', 'host', 'port', 'protocol', [sequelize.fn('count', 'snapshot.id'), 'snapshot_count']],
        include: [{
          model: models.snapshot,
          attributes: ['headers', 'status_code', 'page_title'],
          require: true
        }],
        group: ['webpage.id', 'snapshots.id']
      });
    }

    const total_webpages = await models.webpage.count();

    res.status(200).json({total: total_webpages, webpages: webpages});
  });

  app.get('/webpages/:id', async function (req, res) {
    const webpage = await models.webpage.findOne(
      {
        where: {
          id: req.params.id
        },
        include: [{
          model: models.snapshot,
          require: true
        }]
      }
    );

    if (!webpage) {
      // todo do somethin
      res.status(404);
      res.end('Not found');
    }

    // get the snapshot data

    const snapshots = await webpage.getSnapshots();    

    res.status(200).json({ webpage: webpage, snapshots: snapshots });
  });
}

app.post('/workers/add', async function(req, res) {
  var name = req.body.worker_name;
  var url = req.body.worker_url;
  var tabs = parseInt(req.body.worker_tabs);

  try {
    await init_remote_cluster(name, url, tabs, 10000);
    res.status(200).json({success: true, workers: worker_meta});
  }  catch (err) {
    console.log("error adding worker: ", err);
    res.status(200).json({success: false, error: err.toString()});
  }
});

app.get('/workers', async function(req, res) {
  res.status(200).json({success: true, workers: worker_meta});
});

async function init_db() {
  console.log(`Checking database connection...`);
  try {
    await sequelize.authenticate();
    console.log('Database connection OK!');
  } catch (error) {
    console.log('Unable to connect to the database:');
    console.log(error.message);
    process.exit(1);
  }
}

//init_remote_cluster("hm9k-ec2", "http://18.207.172.247:8082/", 4, 10000);
//init_remote_cluster("mediapc", "http://192.168.0.88:4123/", 12, 10000)

init_cluster();
init_ws();
init_express();
init_db();