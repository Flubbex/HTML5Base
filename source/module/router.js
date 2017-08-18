var routerModule = function(sandbox) {

  var Router = sandbox.Backbone.Router.extend({
      routes: {
        ":query":                 "loadPage",
      },
      loadPage: function(query) {
        sandbox.emit("loadpage",query);
      }

    });

  return {
    init: function() {
      console.log("\t","Starting RouterModule");
      this.router = new Router();
      sandbox.Backbone.history.start();
    },
    destroy: function() {
      console.log("\t","Destroying RouterModule");
    }
  };
};

module.exports = routerModule;
