var jerk = require('./Jerk/lib/jerk'),
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
      var c = JSON.parse(body);
      message.say((c.credit) ? c.fact + ' ' + c.credit : c.fact);
    })
}

var channelMessages = {},
    nick = "crockbot";
  
jerk.jerk(function (j) {
  // j.watch_for('', function (message) {
  //   if (message.channel !== "crockbot" && !channelMessages[message.channel]) {
  //     channelMessages[message.channel] = message;
  //     crockbot(message)
  //     setInterval(function () {crockbot(message)}, 1 * 1000 * 60 * 60)
  //   }
  // })
  
  j.watch_for("crockford", function (message) {
    crockbot(message);
  })
  j.watch_for("Crockford", function (message) {
    crockbot(message);
  })
  j.watch_for(nick, function (message) {
    crockbot(message);
  })
}).connect({nick:nick, channels:["#windmill", "#node.js", "#couchdb", "#yajl"], server:"irc.freenode.net"})
    
