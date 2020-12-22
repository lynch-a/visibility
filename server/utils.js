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
