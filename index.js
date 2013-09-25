"use strict";

var http = require("http"),
    net = require("net"),
    url = require("url");

var request = require("request");

http.globalAgent.maxSockets = Infinity;

module.exports = function(options) {
  options = options || {};

  var consumerKey = options.consumerKey || process.env.OAUTH_CONSUMER_KEY || "",
      consumerSecret = options.consumerSecret || process.env.OAUTH_CONSUMER_SECRET || "",
      token = options.token || process.env.OAUTH_TOKEN || "",
      tokenSecret = options.tokenSecret || process.env.OAUTH_TOKEN_SECRET || "";

  if (!consumerKey || !consumerSecret) {
    console.warn("Warning: consumer key and/or secret are empty--expect the unexpected.");
  }

  var server = http.createServer(function(req, res) {
    // TODO are there other headers that should be dropped?
    // how are Connection headers supposed to be handled?
    delete req.headers["proxy-connection"];

    // TODO add X-Forwarded-For headers

    var target = url.parse(req.url);

    if (options.ssl) {
      target.protocol = "https:";
    }

    var upstream = request({
      uri: target,
      method: req.method,
      oauth: {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        token: token,
        token_secret: tokenSecret
      }
    });

    upstream.on("error", function(err) {
      console.error("%s:", url.format(target), err.message);

      res.writeHead(500);
      res.end();
    });

    req.pipe(upstream);
    upstream.pipe(res);
  });

  server.on("connect", function(req, socket, head) {
    console.warn("CONNECT method in use; requests will not be signed.");

    var parts = req.url.split(":", 2);

    // TODO connect to myself and present a self-signed certificate?
    var conn = net.connect(parts[1], parts[0], function() {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");

      socket.pipe(conn);
      conn.pipe(socket);

      conn.write(head);
    });
  });

  return server;
};
