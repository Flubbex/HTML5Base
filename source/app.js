var Stapes  = require("stapes"),
    layouts = require('handlebars-layouts');

//Your application
var Application = Stapes.subclass({
  constructor: function(config,include,modules) {
    //Assigns to the current application:
    Object.assign(this,
                  include,           //Some libraries
                  {config:config,    //Some config options (app.config)
                  modules:modules}); //some modules (app.modules)

    //Instantiate templates by injecting Handlebars
    this.template = this.template(this.Handlebars);

    //Handlebar setup for layout support
    this.Handlebars.registerHelper(layouts(this.Handlebars));

    //Register layout partial
    this.Handlebars.registerPartial('layout', this.template['layout']);

    //Start when domcontent is loaded
    window.addEventListener("load",
                             this.util.delegated(this,'start'),
                             {once:true});

    //Initialize all the modules
    var application     = this;
    var modules         = this.modules;
    application.modules = Object.keys(modules)
                          .map(function(name){
      return new modules[name](application);
    });
  },
  start:function(){
    console.log("Application Started","[~"+this.util.perfnow()+"ms]");
    this.emit("start");
  }

});

module.exports = Application;
