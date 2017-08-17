var include   = require("./include.js");

//Sandbox
module.exports = function(core, instanceid, options, moduleid) {
   //provides the Mediator methods 'on', 'emit', etc.
   //Obsoleted by atom-js (Flubbex)
  //core._mediator.installTo(this);

  //Assign includes to sandbox
  Object.assign(this,include);

  //Provides Mediator functions and more
  Object.assign(this,this.atom());

  //Some data
  this.model = {
    name:"Fluxbuild"
  };

  //Load templates
  this.template = this.template(this.Handlebars);

  //Utility
  this.merge = function(){
    var args = [].slice.call(arguments);
    args.unshift({});
    return Object.assign.apply(this,args);
  };

  //Handlebar setup for layout support
  this.Handlebars.registerHelper(
    require('handlebars-layouts')(this.Handlebars));

  //Register layout partial
  this.Handlebars.registerPartial('layout', this.template['layout']);


};
