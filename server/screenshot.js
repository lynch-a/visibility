const workers = require('./workers');
const utils = require('./utils');
const sequelize = require('./db');
const { models } = sequelize;
const socket_emitter = require('./socket_emitter');

async function queue_screenshots(req, res) {
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

  var queue = [];

  for (let target of req.body.targets) {
    for (let http_port of http_ports) {
      let screenshot_options = {
        job_id: workers.job_id_inc,
        url: `http://${target}:${http_port}`,
        port: parseInt(http_port),
        images: request_images,
        scripts: request_scripts
      }

      queue.push(screenshot_options);

      workers.job_id_inc++;
    }

    for (let https_port of https_ports) {
      let screenshot_options = {
        job_id: workers.job_id_inc,
        url: `https://${target}:${https_port}`,
        port: parseInt(https_port),
        images: request_images,
        scripts: request_scripts
      }

      queue.push(screenshot_options);
      workers.job_id_inc++;
    }
  }

  // distribute the queued jobs based on how many tabs each worker has available
  if (workers.workers.length > 0) {
    queue_loop: while (queue.length > 0) {
      for(let [index, worker] of workers.workers.entries()) {
        for(var i = 0; i < workers.metadata[index]["total_tabs"]; i++) {
          var temp_job = queue.shift();

          // add worker id to job
          temp_job.worker_id = index;

          worker.queue(temp_job, do_ss);

          workers.metadata[index].queued++

          if (queue.length == 0) {
            break queue_loop;
          }
        }
      }
    }
  }

  res.status(200).json({"success": true, workers: workers.metadata});
}

async function do_ss({ page, data: data}) {
  console.time(`total-ss-time-${data["worker_id"]}-${data["job_id"]}`);
  try {
    var response = await page.goto(data["url"], { waitUntil: 'domcontentloaded' });

    var b64 = await page.screenshot(
      {
        encoding: "base64",
        type: "jpeg",
        //fullPage: true
        //path: `screenshots/${file_name}.png`,
      }
    );

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
      });
    } catch (err) {
      console.log("error in database save:", err);
    }

    console.log("screenshot taken: ", data["url"]);
  } catch (err) {
    console.log("couldn't take screenshot of: ", data["url"]);
  } finally {
    workers.metadata[data["worker_id"]].queued--;

    socket_emitter.emit('worker-update', {
      worker_id: data["worker_id"],
      worker: workers.metadata[data["worker_id"]]
    });
  }
  console.timeEnd(`total-ss-time-${data["worker_id"]}-${data["job_id"]}`);
}

module.exports = {
  queue_screenshots
}