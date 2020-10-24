module.exports.getParsedUrl = function(url) {
  var parsed_url = new URL(url);
  var parsed_port = parsed_url.port;

  if (parsed_port == '') {
    switch(parsed_url.protocol) {
      case 'http:':
        parsed_port = 80;
        break;
      case 'https:':
        parsed_port = 443;
        break;
    }
  }

  return {
    "host": parsed_url.hostname,
    "protocol": parsed_url.protocol,
    "port": parsed_port
  };
}
