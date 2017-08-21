var bulk = require("bulk-require");
    util = bulk(__dirname+"/util","*.js");

module.exports = {
  $:require("zest"),
  Handlebars:require("handlebars"),
  layouts:require('handlebars-layouts'),
  template:require("./template"),
  emitter:require("./lib/fluxmitter"),
  util:util,
}
