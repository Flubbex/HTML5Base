var assert      = require('assert'),
    scale       = require("scaleapp"),
    Sandbox     = require("../sandbox"),
    PageModule  = require("../../source/module/page");

describe("pageModule",function(){
  var sandbox    = Sandbox(new scale.Core(),"page",{},"page");
  var pagemodule = PageModule(sandbox);

  it('Should have a view', function() {
    assert.equal(typeof(pagemodule.view),"object");
  });

  describe('PageModule.loadPage()', function() {
    pagemodule.loadPage("home");
    it('Should render a page', function() {
      assert.equal(typeof(core),"object");
    });
  })

})

return sandbox;
