var assert  = require('assert');
var app     = require("../source/index");
var include = require("./include");

describe('Core', function() {
  it('Returns an object', function() {
    assert.equal(typeof(app), "object");
  });
  it('Contains a configuration object', function() {
    assert.equal(typeof(app.config), "object");
  });
  it('Contains a sandbox function', function() {
    assert.equal(typeof(app.sandbox), "function");
  });
  it('Contains an initialize function', function() {
    assert.equal(typeof(app.initialize), "function");
  });
  it('Contains a start function', function() {
    assert.equal(typeof(app.start), "function");
  });
  it('Contains included libraries', function() {
    for (var attr in include)
      assert.ok(app[attr],attr);
  });
  it('Contains a hashlist of modules', function() {
    assert.equal(typeof(app.modules),"object")
  });
});

module.exports = app;
