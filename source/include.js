var bulk = require("bulk-require");
    util = bulk(__dirname+"/util","*.js");

module.exports = {
  $:require("zest"),
  Backbone:require("backbone"),
  Handlebars:require("handlebars"),
  template:require("./template"),
  util:util,
}
