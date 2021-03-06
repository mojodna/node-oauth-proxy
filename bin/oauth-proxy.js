#!/usr/bin/env node

"use strict";

var opts = require("optimist")
  .usage("Usage: $0 --consumer-key <consumer key> --consumer-secret <consumer secret>\n" +
         "       [--token <token>] [--token-secret <token secret>] [-p <proxy port>] [--ssl]")
  .describe("consumer-key", "OAuth Consumer Key")
  .describe("consumer-secret", "OAuth Consumer Secret")
  .describe("token", "OAuth Access/Request Token")
  .describe("token-secret", "OAuth Access/Request Token Secret")
  .describe("p", "Proxy port")
  .alias("p", "port")
  .describe("ssl", "Make upstream requests via HTTPS")
  .describe("version", "Display the version number")
  .describe("help", "Display this help message");

var argv = opts.argv;

switch (true) {
  case argv.help:
    opts.showHelp();
    process.exit();

  case argv.version:
    console.log("oauth-proxy v%s (request v%s, oauth-sign v%s)",
                require("../package.json").version,
                require("request/package.json").version,
                require("request/node_modules/oauth-sign/package.json").version);
    process.exit();
}

var server = require("../")({
  consumerKey: argv["consumer-key"],
  consumerSecret: argv["consumer-secret"],
  token: argv.token,
  tokenSecret: argv["token-secret"],
  ssl: argv.ssl
})
  // TODO add an option to specify the interface to listen on
  .listen(argv.port || process.env.PORT || 8001, function() {
    console.log("Listening at http://%s:%d/", this.address().address, this.address().port);
  });

process.on("SIGINT", function() {
  server.close(function() {
    process.exit();
  });
});
