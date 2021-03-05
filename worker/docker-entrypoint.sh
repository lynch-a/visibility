#!/bin/bash
service ssh start

chromium-browser --headless --no-sandbox --mute-audio --disable-setuid-sandbox --disable-crash-reporter --no-first-run --disable-client-side-phishing-detection --window-size=1366,768 --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --user-data-dir=/tmp

