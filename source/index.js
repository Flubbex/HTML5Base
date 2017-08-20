console.log("[Entrypoint @ " + new Date().toString().slice(16, 24) + "]");

var bulk = require('bulk-require'),
  Application = require("./app"),
  config = require("../config/app"),
  include = require("./include"),
  modules = bulk(__dirname + "/module", "*.js");

/**
  Used internally to instantiate an application using provided arguments and returns it.
 *
   @param {object} application The object on which to call the function.
   @param {object} config Configuration file
   @param {object} include Hashmap of includables ( libraries e.g. ).
   @param {object} modules Hashmap of modules.
   @returns {object} An instantiated application
*/
function initialize(application, config, include, modules) {
  return new application(config, include, modules);
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
function setup(application, config, include, modules) {
  if (this.started)
    console.warn("Warning: App setup called while already started")

  console.log("Initializing Application");

  this.app = this.initialize(application, config, include, modules);

  console.log("Finished Initialization [~" + include.util.perfnow() + "ms]");

  return this.app;
};

module.exports = {
  app: null,
  started: false,
  initialize: initialize,
  setup: setup
};

//Autostarter for browsers
if (typeof(window) !== "undefined")
  window.app = module.exports.setup(Application, config, include, modules);
