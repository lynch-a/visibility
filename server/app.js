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
app.use(express.json());



async function init_cluster() {
  cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 10,
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

  await cluster.task(async ({ page, data: url }) => {
    await page.setRequestInterception(true);
      page.on('request', request => {
        if (false) {
          if (request.resourceType() === 'script') {
            request.abort();
            return;
          }
      }

      if (false) {
        if (request.resourceType() === 'image') {
          request.abort();
          return;
        }
      }

      request.continue();
    });
    console.log("going to url: " + url);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    console.log("done visiting url");
    //var file_name = url.replace("://", "-").replace(".", "-").replace(":", "-");

    var b64 = await page.screenshot(
      {
        encoding: "base64"
        //path: `screenshots/${file_name}.png`,
      }
    );

    console.log(`Screenshot taken: ${url}`);
    //console.log(b64);
    // fire event to WS
    console.log("url: " + url);
    var {host, protocol, port} = utils.getParsedUrl(url);

    const data = {
      host,
      protocol,
      port,
      "img": `data:image/png;base64,${b64}`
    };

    await models.host.create(data);

    Socketio.sockets.emit('screenshot-taken', data);
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

  app.post('/scan', async function (req, res) {
      if (!req.body.hosts) {
        return res.end('No hosts in POST body detected - 1');
      }

      if (req.body.hosts.length < 1) {
        return res.end('No hosts in POST body detected - 2');
      }

      try {
        for (let host of req.body.hosts) {
          const screen = await cluster.queue(`${host.protocol}://${host.host}:${host.port}`);
        }
        // respond with image
        res.status(200).json({"success": true});
        res.end('{ "success": true }');
      } catch (err) {
        // catch error
        res.end('Error: ' + err.message);
      }
  });

  app.get('/hosts', async function (req, res) {
    const hosts = await models.host.findAll();
    res.status(200).json(hosts);
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