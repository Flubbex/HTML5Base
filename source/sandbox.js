var include   = require("./include.js");

//Sandbox contains a generalized API for your application
var sandbox = function(core, instanceid, options, moduleid) {
   //provides the Mediator methods 'on', 'emit', etc.
  core._mediator.installTo(this);

  //Assign includes to sandbox
  Object.assign(this,include);

  //Provides a generalized data structure around options
  this.config = this.atom(options);

  //Load templates
  this.template = this.template(this.Handlebars);

  //Object merging utility
  this.merge = function(){
    var args = [].slice.call(arguments);
    args.unshift({});
    return Object.assign.apply(this,args);
  };

  //Handlebar setup for layout support
  this.Handlebars.registerHelper(require('handlebars-layouts')
                                (this.Handlebars));

  //Register layout partial
  this.Handlebars.registerPartial('layout', this.template['layout']);


};

module.exports = sandbox;
