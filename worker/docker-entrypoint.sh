#!/bin/bash
service ssh start

chromium-browser --headless --no-sandbox --disable-gpu --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --user-data-dir=/tmp