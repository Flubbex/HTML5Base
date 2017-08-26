var assert  = require('assert');
var app     = require("../source/index");

describe('Core', function() {
  it('Returns an object', function() {
    assert.equal(typeof(app), "object");
  });
  it('Contains a configuration object', function() {
    assert.equal(typeof(app.config), "object");
  });
  it('Contains an initialize function', function() {
    assert.equal(typeof(app.initialize), "function");
  });
  it('Contains a start function', function() {
    assert.equal(typeof(app.start), "function");
  });
});

module.exports = app;
