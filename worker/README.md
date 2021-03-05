How to use
==

Add your public ssh to `authorized_keys` file in this directory

Build the docker container:

`docker build -f worker.Dockerfile -t visibility:worker .`

Save the docker image for transport to any number of other servers such as single ec2 instances or other computers laying around your house:

`docker save visibility:worker | gzip > worker.tar.gz`

Load the container elsewhere:

`gunzip -c worker.tar.gz | docker load`

Run the container with the ability to access ssh over your desired port:

`docker run -dp 40022:22 visibility:worker`

Turn it off when done:

`docker ps` -> get container ID

`docker stop <container id>`


---

Install docker and run worker on ec2 instance

sudo apt-get update
sudo apt install -y docker.io
sudo systemctl start docker
sudo usermod -a -G docker ubuntu
gunzip -c worker.tar.gz | sudo docker load
sudo docker run -dp 40022:22 visibility:worker

Remove stopped containers

sudo docker rm $(sudo docker ps -a -q)
