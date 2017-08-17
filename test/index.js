var assert  = require('assert');
var scale   = require("scaleapp");
var dom     = require('jsdom-global')();
var all     = require("require-all");

var app     = require("./core");
var config  = require("./config");
var sandbox = require("./sandbox");

describe("Application",function(){
  var modules = all(__dirname,"module");

  describe('app.initialize()', function() {
    var core = app.initialize(scale,sandbox,config,app.modules);
    it('Should return an application (core)', function() {
      assert.equal(typeof(core),"object");
    });
    it('Should have started', function() {
      assert.equal(app.started,true);
    });
  })

})
