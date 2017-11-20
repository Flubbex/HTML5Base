window.$          = require("zest");

var perfnow       = require("util/perfnow"),
    swapCSS       = require("util/swapcss"),
    fluxbottle    = require("fluxbottle"),
    config        = require("../config/app"),
    bulk          = require('bulk-require'),
    content       = bulk(__dirname , ["service/*.js",
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
  
  let routeHandler = (options) =>
                      container.page.loadPage(options.page,options.subpage);
    
  container.router.add("{page}/{subpage}", routeHandler );
  container.router.add("{page}",           routeHandler );
  
  
  return {
    fadeIn: function(duration,steps){
      
    let html = $("html")[0],
        opacity = 0,
        lift = function(){
          opacity += 1/steps;
          
          html.style.opacity = opacity.toString();
      
          if (opacity < 1)
            window.setTimeout(lift,10)
          else
            console.log("Finish")
        };
        
    html.style.opacity = opacity;
    html.style.display = "block";
    
    
    window.setTimeout(lift,duration/steps)
    },
    start:    function() {
    console.log("\t","Application Started", "[~" + perfnow() + "ms]");
    
    container.style = swapCSS($("#theme")[0]);
    
    $("#themeselect")[0].addEventListener("change",(e) => {
      let uri = "https://jenil.github.io/bulmaswatch/"+e
                                            .srcElement
                                            .value+"/bulmaswatch.min.css";
      container.style.swap(uri);
    })
  
    container.page.start();
    
    window.addEventListener("hashchange",
                                (e) => container.router.run()
                              );
    
    if (window.location.hash === "")
      window.location.hash = "home"
    
    container.router.run();
    
    this.fadeIn(750,10);
    
    }
  }
};

window.app = fluxbottle.setup(Application,config,content);

module.exports = Application;
