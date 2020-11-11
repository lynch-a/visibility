const { Cluster } = require('puppeteer-cluster');
const { ArgumentParser } = require('argparse');
const fs = require('fs');

const parser = new ArgumentParser({
  description: 'Take web screenshots quickly.',
  add_help: true
});

parser.add_argument('--http-ports', {
        default: "80",
        help: "8080 or 1-80 or 80,443,8443 formats supported. Default: 80"
    });

parser.add_argument('--https-ports', {
        default: "443",
        help: "8080 or 1-80 or 80,443,8443 formats supported. Default: 443"
    });

parser.add_argument('--tabs', '-t',  {
        default: "20",
        required: false,
        help: "Number of worker tabs. Default: 20"
    });

parser.add_argument('--no-images', '--noimages', '-ni', {
        default: false,
        required: false,
        action: 'store_true',
        help: "Don't allow headless browser to request images."
    });

parser.add_argument('--no-scripts', '--noscripts', '-ns', {
        default: false,
        required: false,
        action: 'store_true',
        help: "Don't allow headless browser to request scripts."
    });

parser.add_argument('-f', '--file', { help: "input file, line delimited"});

var args = parser.parse_args();

function parse_ports(port_arg) {
    var ports = [];

    if (port_arg.includes("-")) {
        var range = port_arg.split("-");
        var start = parseInt(range[0]);
        var end = parseInt(range[1]);

        if (end < start) {
            console.log("invalid ports, bud");
            process.exit(1);
        }

        for (var i = start; i < end+1; i++) {
            ports.push(i);
        }
    } else if (port_arg.includes(",")) {
        var csv = port_arg.split(",");
        for (var i = 0; i < csv.length; i++) {
            ports.push(csv[i]);
        }
    } else {
        ports.push(parseInt(port_arg));
    }

    return ports;
}

// parse options and args
var http_ports = [];
var https_ports = [];
var no_images = false;
var no_scripts = false;
var num_tabs = 20;

if (args.http_ports) {
    http_ports = parse_ports(args.http_ports);
}

if (args.https_ports) {
    https_ports = parse_ports(args.https_ports);
}

if (args.no_images) {
    no_images = true;
}

if (args.no_scripts) {
    no_scripts = true;
}

if (args.tabs) {
    num_tabs = parseInt(args.tabs);
    if (num_tabs <= 0) {
        num_tabs = 1;
    }
}


// skip callback for fs by placing in async... thanks node
var targets = [];

const csvFile = fs.readFileSync(args.file).toString();
const lines = csvFile.split('\n');
for (let i = 0; i < lines.length; i++) {
    targets.push(lines[i]);
}

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: num_tabs,
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
                '--disable-background-networking'
            ]
        },
        monitor: true,
        timeout: 10000
    });

    await cluster.task(async ({ page, data: url }) => {
        await page.setRequestInterception(true);

        //handle blocking images/scripts, if desired
        page.on('request', request => {
            if (no_scripts) {
                if (request.resourceType() === 'script') {
                    request.abort();
                    return;
                }
            }

            if (no_images) {
                if (request.resourceType() === 'image') {
                    request.abort();
                    return;
                }
            }

            request.continue();
        });

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        var file_name = url.replace("://", "-").replace(".", "-").replace(":", "-");

        await page.screenshot(
            {
              //encoding: "base64"
              path: `screenshots/${file_name}.png`,
            }
        );

        console.log(`Screenshot taken: ${url}`);
        c//onsole.log(b64);
    });

    // In case of problems, log them
    cluster.on('taskerror', (err, data) => {
        console.log(`Error crawling ${data}: ${err.message}`);
    });

    for (var t = 0; t < targets.length; t++) {
        if (http_ports.length > 0) {
            for(var p = 0; p < http_ports.length; p++) {
                var http_target = 'http://' + targets[t] + ":" + http_ports[p]
                cluster.queue(http_target);
            }
        }

        if (https_ports.length > 0) {
            for(var p = 0; p < https_ports.length; p++) {
                var https_target = 'https://' + targets[t] + ":" + https_ports[p]
                cluster.queue(https_target);
            }
        }
    }

    await cluster.idle();
    await cluster.close();
})();