How to use
==

Add your public ssh to `authorized_keys` file in this directory

Build the docker container:

`docker build -f worker.Dockerfile -t visibility:worker .`

Run the container with the ability to access ssh over a specified port:

`docker run -dp 40022:22 visibility:worker`