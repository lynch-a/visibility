module.exports.getParsedUrl = function(url) {
  var parsed_url = new URL(url);

  var hostname = parsed_url.hostname;
  var port = parsed_url.port;

  if (port == '') {
    switch(parsed_url.protocol) {
      case 'http:':
        port = 80;
        break;
      case 'https:':
        port = 443;
        break;
      case 'file:': //todo
        port = 9999;
        break;
    }
  }

  if (port == "" || port == undefined) {
    port = 9999;
  }

  if (hostname == "" || hostname == undefined) {
    hostname = "ERROR";
  }

  return {
    "host": hostname,
    "protocol": parsed_url.protocol.replace(":", ""),
    "port": port
  };
}

module.exports.parsePorts = function(port_arg) {
  var ports = [];

  if (!port_arg) {
    return ports;
  }

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
