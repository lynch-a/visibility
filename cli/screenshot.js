const workers = require('./workers');
const utils = require('./utils');

/*
work: {
  options: {
    http_ports: [80],
    https_ports: [443]
  },
  targets: ['test.com', 'example.com']
}
*/

async function queue_screenshots(work) {
  var http_ports = work.options.http_ports || [];
  var https_ports = work.options.https_ports || [];
  var request_images = work.options.scripts || true;
  var request_scripts = work.options.images || true;

  console.log("Queueing screenshots. Options:");
  console.log("http_ports: ", http_ports);
  console.log("https_ports: ", https_ports);
  console.log("request_images: ", request_images);
  console.log("request_scripts: ", request_scripts);
  console.log("targets: ", work.targets);
  var queue = [];

  for (let target of work.targets) {
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

          // add chosen worker id to job
          temp_job.worker_id = index;
          temp_job.worker_name = workers.metadata[index]["name"];

          worker.queue(temp_job, do_ss);

          workers.metadata[index].queued++

          if (queue.length == 0) {
            break queue_loop;
          }
        }
      }
    }
  }
}

async function do_ss({ page, data: data}) {
  try {
    var response = await page.goto(data["url"], { waitUntil: 'domcontentloaded' });

    var file_name = data["url"].replace("://", "-").replace(":", "-");

    var b64 = await page.screenshot(
      {
        path: `screenshots/${file_name}.png`,
      }
    );

    console.log("[" + data["worker_name"] + "] screenshot taken: ", data["url"]);
  } catch (err) {
    console.log("couldn't take screenshot of: ", data["url"]);
    console.log("-----------");
    console.log(err);
    console.log("-----------");
  } finally {
    workers.metadata[data["worker_id"]].queued--;
  }
}

module.exports = {
  queue_screenshots
}