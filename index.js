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

  var proxyHandler = function(req, res) {
    // TODO are there other headers that should be dropped?
    // how are Connection headers supposed to be handled?
    delete req.headers["proxy-connection"];

    // TODO add X-Forwarded-For headers

    var target = url.parse(req.url);

    if (!target.host) {
      // the server is not operating in proxy mode (req.url does not contain
      // a full URL)
      // TODO check this against a server instance
      target.host = req.headers.host;
      target.hostname = req.headers.host;

      if (this._pipeName) {
        // our HTTPS server doesn't listen on a port, so this is tunneled HTTPS
        target.protocol = "https:";
      }
    }

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
  };

  var server = http.createServer(proxyHandler);
  var fs = require("fs");
  var https = require("https").createServer({
    key: fs.readFileSync("agent2-key.pem"),
    cert: fs.readFileSync("agent2-cert.pem")
  }, proxyHandler);

  https.listen("/tmp/oauth-proxy-https.sock");

  server.on("connect", function(req, socket, head) {
    // connect to myself and present a self-signed certificate
    // this uses a pipe for 2 reasons:
    // 1) no need to make it public
    // 2) we can detect when we're tunneling and set protocol appropriately
    var conn = net.connect("/tmp/oauth-proxy-https.sock", function() {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");

      socket.pipe(conn);
      conn.pipe(socket);

      conn.write(head);
    });
  });

  return server;
};
