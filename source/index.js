console.log("[Entrypoint @ " + new Date().toString().slice(16, 24) + "]");

var bulk = require('bulk-require'),
  scale = require("scaleapp"),
  config = require("../config/app"),
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

  var core         = new scale.Core(sandbox,config.core);
  var moduleconfig = Object.assign({about:config.about},
                                   config.module);

  Object.keys(modules).map(function(name, value) {
    console.log("\t", "Registering module", name)
    core.register(name, modules[name],moduleconfig);
  })

  return core;
};

function start() {
  if (this.started) return;
  if (!this.app)
    throw new Error("Start Error: Application not initialized")

  console.log("Starting Application")

  this.app.start();

  this.started = true;
  window.onDOMContentLoaded = null;
  window.onload = null;

  return this.app;
};

function pageReady() {
  module.exports.start();
  console.log("Finished Setup [~" + "ms]");
};

function setup() {
  if (this.started)
    console.warn("Warning: App setup called while already started")

  console.log("Application Setup");

  this.app = this.initialize(this.scale,
    this.sandbox,
    this.config,
    this.modules);

  window.onDOMContentLoaded = this.pageReady;
  window.onload = this.pageReady;

  console.log("Finished Initialization [~" + "ms]");

  return this.app;
};

module.exports = {
  app:        null,
  started:    false,
  scale:      scale,
  config:     config,
  sandbox:    sandbox,
  modules:    modules,
  initialize: initialize,
  start:      start,
  pageReady:  pageReady,
  setup:      setup
};

//Autostarter for browsers
if (typeof(window) !== "undefined")
  window.app = module.exports.setup();
