"use strict";

var http = require("http"),
    net = require("net");

var request = require("request");

var server = http.createServer(function(req, res) {
  delete req.headers["proxy-connection"];

  var upstream = request({
    uri: req.url,
    method: req.method,
    oauth: {
      consumer_key: process.env.OAUTH_CONSUMER_KEY,
      consumer_secret: process.env.OAUTH_CONSUMER_SECRET,
      token: process.env.OAUTH_TOKEN,
      token_secret: process.env.OAUTH_TOKEN_SECRET
    }
  });

  upstream.on("error", function(err) {
    console.error(err);
    res.writeHead(500);
    res.end();
  });

  req.pipe(upstream);
  upstream.pipe(res);
});

server.on("connect", function(req, socket, head) {
  var parts = req.url.split(":", 2);

  var conn = net.connect(parts[1], parts[0], function() {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");

    socket.pipe(conn);
    conn.pipe(socket);

    conn.write(head);
  });
});

server.listen(process.env.PORT || 8080);
