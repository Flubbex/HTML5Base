//Your application
var Application = function(config, include, modules) {

  //Instantiate templates by injecting Handlebars
  include.template = include.template(include.Handlebars);

  //Handlebar setup for layout support
  include.Handlebars.registerHelper(include.layouts(include.Handlebars));

  //Register layout partial
  include.Handlebars.registerPartial('layout', include.template['layout']);

  //Start all the modules that need starting
  window.addEventListener("DOMContentLoaded",
    function() {
      Object.keys(modules).map(function(name) {
        if (modules[name].start && typeof(modules[name]).start==='function')
          modules[name].start()
      });
    });

  modules.router.on("loadPage", function(name){
    console.log("Loading page:",name,"[~" + include.util.perfnow() + "ms]")
    modules.page.loadPage(name);
  });

  return {
    atom:     include.atom,
    $:        include.$,
    template: include.template,
    util:     util,
    modules:  modules,
    start:    function() {
      console.log("Application Started", "[~" + include.util.perfnow() + "ms]");
      include.emit("start");
    }
  }
};

module.exports = Application;
