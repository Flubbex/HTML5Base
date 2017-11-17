var perfnow   = require("util/perfnow");
console.log("Fluxbottle @ ",new Date().toString().slice(16, 24),"[~"+perfnow()+"ms]");

var Bottle = require("bottlejs");

/**
  Used internally to instantiate an application using provided arguments and returns it.
 *
   @param {object} application The object on which to call the function.
   @param {object} config Configuration file
   @param {object} include Hashmap of includables ( libraries e.g. ).
   @param {object} modules Hashmap of modules.
   @returns {object} An instantiated application
*/
function initialize(app,config,content) {
  var bottle = Bottle(config.about.filename);
  var dependencies = [];

  Object.keys(content).map(function(type){
    var subset = content[type];
    Object.keys(subset).map(function(name){
      var realname = name;
      var name     = subset[name].name||name;

      console.log("\t","Bottling",type,name,"[~" + perfnow() + "ms]");

      bottle[type](name,subset[realname]);
      dependencies.push(name);
    })
  })

  var appdata = [config.about.filename,app]//.concat(dependencies);

  bottle.factory.apply(bottle,appdata);

  return bottle;
};

/**
  Initializes an application using supplied arguments.
  Usually called automatically.
 *
   @param {object} application The object on which to call the function.
   @param {object} config Configuration file
   @param {object} include Hashmap of includables ( libraries e.g. ).
   @param {object} modules Hashmap of modules.
   @returns {object} An instantiated application
*/
function setup(application, config, content) {
  if (this.started)
    console.warn("Warning: App setup called while already started")

  console.log("Initializing Application","[~" + perfnow() + "ms]");

  this.app = this.initialize(application, config, content);

  window.addEventListener("DOMContentLoaded",function(){
    this.app.container.fluxbuild.start();
  });

  console.log("Finished Application Initialization [~" + perfnow() + "ms]");

  return this.app;
};

module.exports = {
  app:        null,
  started:    false,
  initialize: initialize,
  setup:      setup
};
