var perfnow     = require("util/perfnow"),
    fluxbottle  = require("fluxbottle"),
    config      = require("../config/app"),
    bulk        = require('bulk-require'),
    content     = bulk(__dirname , ["service/*.js",
                                  "provider/*.js",
                                  "factory/*.js",
                                  "decorator/*.js",
                                  "middleware/*.js"]);
                                                                  
/**
 * Core for your application that gets bottled into a factory.
 * All your services, factories and such will be bottled beforehand and
 * are accesible from `container`.
 * @param {object} container A BottleJS container
 * @returns {object} service A service to expose
 */
var Application = function(container) {
  container.$ = container.zest;

  container.router.add("{query}", (options) =>
    container.page.loadPage(options.query)
  );

  return {
    start:    function() {
      console.log("\t","Application Started", "[~" + perfnow() + "ms]");
      container.page.start();
   
    window.addEventListener("hashchange",
                                (e) => container.router.run()
                              );
    
    if (window.location.hash === "")
      window.location.hash = "#home";
    
    container.router.run();
    
    }
  }
};

window.app = fluxbottle.setup(Application,config,content);

module.exports = Application;
