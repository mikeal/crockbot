var jerk = require('../Jerk/lib/jerk'),
    sys = require('sys'),
    http = require('http'),
    url = require('url');

var request = function (uri, method, body, headers, client, encoding, callback) {
  if (typeof uri == "string") {
    uri = url.parse(uri);
  }
  if (!headers) {
    headers = {'content-type':'application/json', 'accept':'application/json'};
  }
  if (!headers.host) {
    headers.host = uri.hostname;
    if (uri.port) {
      headers.host += (':'+uri.port)
    }
  }
  if (!uri.port) {
    uri.port = 80;
  }
  if (!client) { 
    client = http.createClient(uri.port, uri.hostname);
  }

  var clientErrorHandler = function (error) {callback(error ? error : "clientError")}

  client.addListener('error', clientErrorHandler);
  if (uri.auth) {
    headers.authorization = "Basic " + base64.encode(uri.auth);
  }
  var pathname = uri.search ? (uri.pathname + uri.search) : uri.pathname
  var request = client.request(method, uri.pathname, headers)

  request.addListener('error', function (error) {callback(error ? error : "requestError")})

  if (body) {
    request.write(body, encoding);
  }

  request.addListener("response", function (response) {
    var buffer = '';
    response.addListener("data", function (chunk) {
      buffer += chunk;
    })
    response.addListener("end", function () {
      client.removeListener(clientErrorHandler);
      callback(undefined, response, buffer);
    })
  })
  request.close()
}


function crockbot (message) {
  request('http://crockfordfacts.com/', 'GET', undefined, undefined, undefined, undefined, 
    function (error, response, body) {
      message.say(body.split('<h2>')[1].split('</h2>')[0]);
    })
}

var channelMessages = {};
  
jerk.jerk(function (j) {
  j.watch_for('', function (message) {
    if (message.channel !== "crockbot" && !channelMessages[message.channel]) {
      channelMessages[message.channel] = message;
      crockbot(message)
      setInterval(function () {crockbot(message)}, 1 * 1000 * 60 * 60)
    }
  })
  
  j.watch_for("crockbot", function (message) {
    crockbot(message);
  })
}).connect({nick:"crockbot", channels:["#windmill", "#node.js", "#couchdb"], server:"irc.freenode.net"})
    