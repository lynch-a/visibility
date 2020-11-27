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

const app = express();
app.use(cors());
let cluster = null;
app.use(express.json({limit: '10mb'}));



async function init_cluster() {
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 20,
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
        '--window-size=1366,768'
      ]
    },
    monitor: false,
    timeout: 10000
  });

  await cluster.task(async ({ page, data: data }) => {
    await page.setRequestInterception(true);
      page.on('request', request => {
        if (data["scripts"] == false) {
          if (request.resourceType() === 'script') {
            request.abort();
            return;
          }
      }

      if (data["images"] == false) {
        if (request.resourceType() === 'image') {
          request.abort();
          return;
        }
      }

      request.continue();
    });

    var response = await page.goto(data["url"], { waitUntil: 'domcontentloaded' });
    //var file_name = url.replace("://", "-").replace(".", "-").replace(":", "-");

    var b64 = await page.screenshot(
      {
        encoding: "base64"
        //path: `screenshots/${file_name}.png`,
      }
    );

    console.log(`Screenshot taken: ${data["url"]}`);

    var {host, protocol, port} = utils.getParsedUrl(data["url"]);
    var pageTitle = await page.evaluate(() => document.title);
    var responseCode = parseInt(response['_status']);
    var ip = response._remoteAddress['ip']; //unused
    var headers = response._headers;

    const webpage_data = {
      protocol: protocol,
      host: host,
      port: port
    };

    const snapshot_data = {
      page_title: pageTitle,
      status_code: responseCode,
      headers: headers,
      image: `data:image/png;base64,${b64}`
    };

    try {
      models.webpage.findOne(
        {
          where: webpage_data
        }
      ).then(async function (db_webpage) {
        console.log(db_webpage);
        var db_snapshot = null;
        if (!db_webpage) {
          db_webpage = await models.webpage.create(webpage_data);
          db_snapshot = await db_webpage.createSnapshot(snapshot_data)
        } else {
          db_snapshot = await db_webpage.createSnapshot(snapshot_data);
        }

        //Socketio.sockets.emit('screenshot-taken', {webpage: db_webpage, snapshot: db_snapshot});
      });


    } catch (err) {
      console.log(err);
    }
  });
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

      try {
        for (let target of req.body.targets) {
          for (let http_port of http_ports) {
            let screenshot_options = {
              "url": `http://${target}:${http_port}`,
              "images": request_images,
              "scripts": request_scripts
            }
            console.log("taking http ss of ", screenshot_options);
            cluster.queue(screenshot_options);
          }

          for (let https_port of https_ports) {
            let screenshot_options = {
              "url": `https://${target}:${https_port}`,
              "images": request_images,
              "scripts": request_scripts
            }
            console.log("taking https ss of ", screenshot_options);
            cluster.queue(screenshot_options);
          }
        }
        res.status(200).json({"success": true});
        res.end('{ "success": true }');
      } catch (err) {
        res.end('Error: ' + err.message);
      }
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
        group: ['webpage.id'],
        include: [{
          model: models.snapshot,
          require: true
        }],
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

init_cluster();
init_ws();
init_express();
init_db();