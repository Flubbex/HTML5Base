var Stapes = require("stapes");

var routerModule = Stapes.subclass({
  constructor: function(app) {
    this.Router = app.Backbone.Router.extend({
        routes: {
          ":query": "loadPage",
        },
        loadPage:app.util.delegated(this,'loadPage',app)
      });

    app.on("start",app.util.delegated(this,'start',app));
  },
  loadPage: function(app,query) {
    app.emit("loadpage", query);
  },
  start: function(app) {
    console.log("\t", "Starting RouterModule","[~"+app.util.perfnow()+"ms]");
    this.router = new this.Router();
    app.Backbone.history.start();
  },
  destroy: function() {
    console.log("\t", "Destroying RouterModule");
  }
})

module.exports = routerModule;
