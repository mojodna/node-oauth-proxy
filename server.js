"use strict";

var server = require("./")().listen(process.env.PORT || 8001, function() {
  console.log("Listening at http://%s:%d/", this.address().address, this.address().port);
});

process.on("SIGINT", function() {
  server.close(function() {
    process.exit();
  });
});
