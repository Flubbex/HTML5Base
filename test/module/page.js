var scale       = require("scaleapp");
var assert      = require('assert');
var pageModule  = require("../../source/module/page");
var sandbox     = require("../sandbox");

describe("pageModule",function(){
  var core = new scale.Core(sandbox);
  it("Should be instantiable as a module",function(){
    core.register("page",pageModule);
    return assert.equal(typeof(core._modules.page),"object");
  })

})

module.exports = pageModule;
