var assert    = require('assert');
var include   = require("./include");
var sandbox   = require("../source/sandbox.js");


describe('Sandbox', function() {
  it('Returns a function', function() {
    assert.equal(typeof(sandbox), "function");
  });
});

module.exports = sandbox;
