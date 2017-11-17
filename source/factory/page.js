var perfnow     = require("util/perfnow"),
    PageView    = require("../view/page"),
    SidebarView = require("../view/sidebar");

module.exports = function page(container) {
  console.log("Initializing pageFactory","[~" + perfnow() + "ms]")
  return {
    start: function() {
      console.log("\t", "Starting pageFactory", "[~" + perfnow() + "ms]");

      this.sidebar = new SidebarView({
        el: "sidebar",
        template: container.template.sidebar,
        model: container.config.about,
        nav: container.$("#nav--super-vertical-responsive")[0]
      });

      this.view = new PageView({
        el: "page",
        template: container.template.page,
        model: container.config.about
      });
    },
    loadPage: function(name) {
      this.view.render(name);
    },
    destroy: function() {
      console.log("\t", "pageFactory Destroyed");
    }
  }
};
