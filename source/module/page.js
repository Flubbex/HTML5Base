var PageView    = require("../view/page"),
    SidebarView = require("../view/sidebar");

var pageModule = function(config,include) {
  console.log("Initializing PageModule","[~" + include.util.perfnow() + "ms]")
  return {
    start: function() {
      console.log("\t", "Starting PageModule", "[~" + include.util.perfnow() + "ms]");

      this.sidebar = new SidebarView({
        el: "#sidebar",
        template: include.template.sidebar,
        model: config.about,
        nav: include.$("#nav--super-vertical-responsive")[0]
      });

      this.view = new PageView({
        el: "#page",
        template: include.template.page,
        model: config.about
      });

      this.view.render("home");
    },
    loadPage: function(name) {
      this.view.render(name);
    },
    destroy: function() {
      console.log("\t", "PageModule Destroyed");
    }
  }
};

module.exports = pageModule;
