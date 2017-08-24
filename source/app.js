var perfnow     = require("./util/perfnow"),
    Backbone    = require("backbone");
//Your application
var Application = function(container) {
  container.$ = container.zest;

  container.router.on("route:loadPage", function(name){
    console.log("Loading page:",name,"[~" + perfnow() + "ms]")
    container.page.loadPage(name);
  });

  return {
    start:    function() {
      console.log("\t","Application Started", "[~" + perfnow() + "ms]");
      container.page.start();

      var history = Backbone.history.start();
      if (!history)
        container.page.loadPage('home');

    }
  }
};

module.exports = Application;
