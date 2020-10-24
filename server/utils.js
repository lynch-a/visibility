module.exports.getPortForUrl = function(url) {
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
  
  return parsed_port;
}
