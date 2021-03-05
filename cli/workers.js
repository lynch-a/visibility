const os = require('os');
const { Cluster } = require('puppeteer-cluster');
const workers = [];
const metadata = {};

async function init_remote_cluster(name, browserURL, tabs, timeout) {
  try {
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
  } catch (err) {
    console.log("PROBLEM!!!");
    console.log("Couldn't access remote worker: ", browserURL);
    console.log("Please check configuration and ensure you can visit " + browserURL + " from the computer running this script");
    console.log("-----");
    console.log("verbose error:", err);
    process.exit(1);
  }
}

async function init_local_cluster(tabs) {
  try {
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

    workers[workers.length] = puppeteer_cluster;

    metadata[workers.length-1] = {
      id: 0,
      name: "local",
      url: "<local>",
      total_tabs: tabs,
      queued: 0
    }
  } catch (err) {
    console.log("PROBLEM!!!");
    console.log("Couldn't create local worker");
    console.log("Is puppeteer installed correctly?");
    console.log("-----");
    console.log("verbose error:", err);
    process.exit(1);
  }
}

module.exports = {
	workers,
	metadata,
	init_remote_cluster,
	init_local_cluster
}
