var pageViewData    = require("../view/page");
var sidebarViewData = require("../view/sidebar");

var pageModule = function(sandbox) {

  var PageView       = sandbox.Backbone.View.extend(pageViewData);
  var SidebarView    = sandbox.Backbone.View.extend(sidebarViewData);

  return {
    init: function() {
      console.log("\t","Starting PageModule");

      this.sidebar = new SidebarView({
        el: "#sidebar",
        template: sandbox.template.sidebar,
        model: sandbox.config.get('about'),
        nav: sandbox.$("#nav--super-vertical-responsive")[0]
      });

      this.view = new PageView({
        el: "#page",
        template: sandbox.template.page,
        model:    sandbox.config.get('about')
      });
      
      sandbox.on("loadpage",this.loadPage,this);

      this.view.render("home");
    },
    loadPage:function(name){
      this.view.render(name);
    },
    destroy: function() {
      console.log("\t","PageModule Destroyed");
    }
  };
};

module.exports = pageModule;
