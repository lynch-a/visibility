const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socket_emitter = require("./socket_emitter");
const io = require("socket.io")(server);
const fs = require('fs');
var sqlite3 = require('sqlite3').verbose()
const url = require('url');
const sequelize = require('./db');
const { models } = sequelize;
const cors = require('cors');

app.use(cors());
app.use(express.json({limit: '10mb'}));

// api routes
const screenshot = require('./screenshot');
const workers = require('./workers');
const webpages = require('./webpages');

app.post('/scan/screenshots', screenshot.queue_screenshots);

app.post('/workers/add', workers.add);
app.get('/workers/create', workers.create_ec2);
app.get('/workers', workers.list);

app.get('/webpages', webpages.list);
app.get('/webpages/:id', webpages.get_webpage);

io.on("connection", socket => {
  socket.emit('{"working": true}');
  console.log("Received connection");
});

socket_emitter.on('worker-update', function(details) {
  //console.log("received event: ", details);
  io.sockets.emit('worker-update', details);
});

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

//init_remote_cluster("hm9k-ec2", "http://18.207.172.247:8082/", 4, 10000);
//init_remote_cluster("mediapc", "http://192.168.0.88:4123/", 12, 10000)

workers.init_cluster();
init_db();

server.listen(3000);