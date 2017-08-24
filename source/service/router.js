var perfnow = require("../util/perfnow"),
  Backbone = require("backbone");

module.exports = function router() {

  console.log("Initializing RouterModule", "[~" + perfnow() + "ms]")

  var Router = Backbone.Router.extend({
    routes: {
      ":query": "loadPage",
    }
  });

  return new Router();
};
