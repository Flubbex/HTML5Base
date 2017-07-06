console.log("Initializing fluxbuild");
fluxbuild = {};

//App config
fluxbuild.config         = require("../config/app"),

//App Dependencies
fluxbuild.$              =
                        function(e){
                          return document.getElementById(e)
                        }
//window.jQuery           = require("jquery");
fluxbuild.Backbone       = require("backbone");
fluxbuild.emitter        = require("./lib/fluxmitter");
fluxbuild.Handlebars     = require("handlebars/runtime");

//App Templates (Generated)
fluxbuild.template       = require("./templates");

//Handlebar setup for layout support
fluxbuild.Handlebars.registerHelper(
  require('handlebars-layouts')(fluxbuild.Handlebars));

//Register layout partial
fluxbuild.Handlebars.registerPartial('layout',fluxbuild.template['layout']);


//Load everything
var content = require("./*/*.js",{mode:'hash'});

//But prettier
for (var entry in content)
{
var dashindex = entry.indexOf("/");
var namespace = entry.slice(0,dashindex);
var name      = entry.slice(dashindex+1,entry.length);

fluxbuild[namespace]       = fluxbuild[namespace] || {};
fluxbuild[namespace][name] = content[entry];
}

//Expands into main app
require("./app.js",{mode:'expand'});

module.exports = fluxbuild;
