var Backbone = require("backbone");

var routerModule  = function(config,include) {

  console.log("Initializing RouterModule","[~" + include.util.perfnow() + "ms]")

  var Router      = Backbone.Router.extend({
    routes: {
      ":query": "loadPage",
    }
  });

  return {
    start: function() {
      console.log("\t", "Starting RouterModule", "[~" + include.util.perfnow() + "ms]");
      this.router = new Router(this);
      this.router.on('route:loadPage',
                    include.util.delegated(this,'emit','loadPage'),
                    this);
      Backbone.history.start();
    },
    destroy: function() {
      console.log("\t", "Destroying RouterModule");
    }
  };
};

module.exports    = routerModule;
