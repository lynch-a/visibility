npm install: puppeteer, puppeteer-cluster argparse

Make sure "screenshots" folder exists in same directory

Usage:
node screenshotsplz.js -f targets.txt --http-ports 80 --http-ports 443


Turbo mode, don't request images or scripts:
node screenshotsplz.js -f targets.txt --http-ports 80 --http-ports 443 -ni -ns