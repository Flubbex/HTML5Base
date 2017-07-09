//Initializes app
module.exports = function(){
  var data = {
    //Capitalise first character for titles
    name:fluxbuild.config.name.charAt(0).toUpperCase() +
        fluxbuild.config.name.slice(1),
    page:Object.keys(fluxbuild.template.page)
          .map(function(e){
                return {address:e,
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
    var mainview = new fluxbuild
                        .view
                        .fluxview({el:       "#main",
                                   template:  fluxbuild.template["page"]["home"],
                                   viewdata:   data});

    var sideview = new fluxbuild
                        .view
                        .fluxview({el:"#sidebar"});

    sideview.render(fluxbuild.template["sidebar"],data);

    router = new AppRouter();

    router.on("route:viewPage",function(page){
      mainview.render(fluxbuild.template["page"][page]);
    })

    fluxbuild.Backbone.history.start();

    if (!location.hash)
      router.navigate("home",{trigger:true})

  };

  return fluxbuild;
}();
