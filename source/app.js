//Initializes app
module.exports = function(){
  var data = {
    //Capitalise first character for titles
    name:fluxbuild.config.name.charAt(0).toUpperCase() +
        fluxbuild.config.name.slice(1),
    page:Object.keys(fluxbuild.template.page)
          .map(function(e){
                return {address:e,
                    //Split underscores into spaces and capitalize accordingly
                        title:e.split("_").map(function(word){
                          return word[0].toUpperCase()+word.slice(1)
                        }).join(" ")
                        }
              })
    },

    AppRouter = fluxbuild.Backbone.Router.extend({
      routes: {
        ":query":          "viewPage"
      }
    });

  window.onload = function(){

    var pageview = new fluxbuild
                        .view
                        .page({el:       "#main",
                               template:  fluxbuild.template["page"],
                               default:   "home",
                               model:     data});

    var sidebarview = new fluxbuild
                        .view
                        .sidebar({el:"#sidebar",
                                  template:fluxbuild.template["sidebar"],
                                  navbutton:"#nav--super-vertical-responsive",
                                  model:data});

    sidebarview.render();

    router = new AppRouter();

    router.on("route:viewPage",function(page){
      pageview.render(page);
    })

    fluxbuild.Backbone.history.start();

    if (!location.hash)
      router.navigate("home",{trigger:true})

  };

  return fluxbuild;
}();
