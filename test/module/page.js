var scale        = require("scaleapp");
var assert       = require('assert');
var Bottle       = require("bottlejs");
var pageFactory  = require("../../source/factory/page");

describe("pageModule",function(){
  var bottle = Bottle().factory('test',pageFactory);
  it("Should be instantiable as a factory",function(){
    return assert.equal(typeof(bottle),"object");
  })

})

module.exports = pageFactory;
