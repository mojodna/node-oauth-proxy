"use strict";

var assert = require("assert");

var async = require("async"),
    connect = require("connect"),
    request = require("request");

var oauthProxy = require("../");

var proxyPort = process.env.PORT || 8001,
    upstreamPort = proxyPort + 1;

describe("oauth-proxy", function() {
  var consumerKey = "key",
      token = "token",
      proxy,
      upstream,
      upstreamServer;

  beforeEach(function(ready) {
    proxy = oauthProxy({
      consumerKey: consumerKey,
      consumerSecret: "secret",
      token: token
    });

    upstream = connect();

    async.parallel([
      function(done) {
        upstreamServer = upstream.listen(upstreamPort, done);
      },
      function(done) {
        proxy.listen(proxyPort, done);
      }
    ], ready);
  });

  afterEach(function(complete) {
    async.parallel([
      function(done) {
        upstreamServer.close(done);
      },
      function(done) {
        proxy.close(done);
      }
    ], complete);
  });

  it("adds an OAuth Authorization header to upstream requests", function(done) {
    upstream.use(function(req, res) {
      // check for the existence of an OAuth authorization header
      assert.ok(req.headers.authorization.match(/^OAuth/));

      var kvp = {};

      req.headers.authorization.slice(6).split(",").forEach(function(pair) {
        var parts = pair.split("=", 2);
        kvp[parts[0]] = parts[1].replace(/"/g, "");
      });

      // ensure that our keys got passed through
      assert.equal(consumerKey, kvp.oauth_consumer_key);
      assert.equal(token, kvp.oauth_token);

      // verifying signature correctness is request's (or one of its
      // dependencies) responsibilities

      return res.end("ok");
    });

    request.get({
      url: "http://localhost:" + upstreamPort + "/test",
      proxy: "http://localhost:" + proxyPort
    }, function(err, rsp, body) {
      assert.equal("ok", body);

      done();
    });
  });
});
