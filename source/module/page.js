var Stapes          = require("stapes"),
￼
    pageViewData    = require("../view/page"),
    sidebarViewData = require("../view/sidebar");

var pageModule = Stapes.subclass({
    constructor:function(app) {
      this.PageView    = app.Backbone.View.extend(pageViewData);
      this.SidebarView = app.Backbone.View.extend(sidebarViewData);

      app.on("start",app.util.delegated(this,'start',app));
      app.on("loadpage",this.loadPage,this);
    },
    start: function(app) {
      console.log("\t","Starting PageModule","[~"+app.util.perfnow()+"ms]");

      this.sidebar = new this.SidebarView({
        el: "#sidebar",
        template: app.template.sidebar,
        model: app.config.about,
        nav: app.$("#nav--super-vertical-responsive")[0]
      });

      this.view = new this.PageView({
        el: "#page",
        template: app.template.page,
        model:    app.config.about
      });

      this.view.render("home");
    },
    loadPage:function(name){
      this.view.render(name);
    },
    destroy: function() {
      console.log("\t","PageModule Destroyed");
    }
});

module.exports = pageModule;
