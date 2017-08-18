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
      console.log("\t","\t","RouterModule Started");
      this.router = new Router();
      sandbox.Backbone.history.start();
    },
    destroy: function() {
      console.log("\t","\t","RouterModule Destroyed");
    }
  };
};

module.exports = routerModule;
