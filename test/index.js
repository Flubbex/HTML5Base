var assert  = require('assert');
var scale   = require("scaleapp");
var dom     = require('jsdom-global')();
var all     = require("require-all");

var app     = require("./core");
var modules = all(__dirname,"module");

describe("Application",function(){
  describe('app.setup()', function() {
    var core = app.setup();
    it('Should return an application (core)', function() {
      assert.equal(typeof(core),"object");
    });
    it('Should have started the application', function() {
      assert.equal(app.started,true);
    });
  })
})
