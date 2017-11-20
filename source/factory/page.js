var perfnow     = require("util/perfnow"),
    PageView    = require("../view/page");

module.exports = function page(container) {
  console.log("Initializing pageFactory","[~" + perfnow() + "ms]")
  
  return {
    view:null,
    start:function(){
      this.view = new PageView({
        el: "#page",
        template: container.template,
        model: container.config.about
      });
    },
    loadPage: function(page,subpage) {
      this.view.render(page,subpage);
    },
    destroy: function() {
      console.log("\t", "pageFactory Destroyed");
    }
  }
};
