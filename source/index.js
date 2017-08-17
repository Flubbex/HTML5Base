console.log("[Entrypoint @ "+new Date().toString().slice(16,24)+"]");
var timespan = Date.now();

var bulk    = require('bulk-require'),
    scale   = require("scaleapp"),
    config  = require("../config/app"),
    sandbox = require("./sandbox"),
    modules = bulk(__dirname + "/module", "*.js");

function initialize(scale, sandbox, config, modules) {
  if (!config)
    throw new Error("Initialize Error: Invalid config passed to initialize");
  if (!scale)
    throw new Error("Initialize Error: Invalid scaleapp library passed to initialize");
  if (!sandbox)
    throw new Error("Initialize Error: Invalid sandbox passed to initialize");
  if (!modules)
    throw new Error("Initialize Error: Invalid module hash passed to initialize");

  console.log("Initializing Application");

  var core = new scale.Core(sandbox);

  Object.keys(modules).map(function(name, value) {
    console.log("\t","Registering module",name)
    core.register(name, modules[name]);
  })

  return core;
};

module.exports = {
  scale:      scale,
  config:     config,
  sandbox:    sandbox,
  modules:    modules,
  initialize: initialize,
  app:        null,
  started:    false,
  start:function(){
    if (this.started) return;
    if (!this.app)
      throw new Error("Start Error: Application not initialized")

    console.log("Starting Application")

    this.app.start()
    this.started              = true;
    window.onDOMContentLoaded = null;
    window.onload             = null;

    return this.app;
  },
  setup: function() {
    if (this.started)
      console.warn("Warning: App setup called while already started")

    console.log("Application Setup");

    this.app = this.initialize( this.scale,
                            this.sandbox,
                            this.config,
                            this.modules);

    var pageReady = function(){
      module.exports.start();
      console.log("Finished Setup [~"+(Date.now()-timespan)+"ms]");

    }

    window.onDOMContentLoaded = pageReady;
    window.onload             = pageReady;

    console.log("Finished Initialization [~"+(Date.now()-timespan)+"ms]");

    return this.app;
  }
}

//Autostarter for browsers
if (typeof(window) !== "undefined")
  window.app = module.exports.setup();
