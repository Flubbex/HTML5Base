var perfnow     = require("./util/perfnow"),
    flux        = require("flux"),
    Backbone    = require("backbone");

/**
 * Core for your application that gets bottled into a factory.
 * All your services, factories and such will be bottled beforehand and
 * are accesible from `container`.
 * @param {object} container A BottleJS container
 * @returns {object} service A service to expose
 */
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
