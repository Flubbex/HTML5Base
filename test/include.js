var assert    = require('assert');
var include   = require("./include");


describe('include', function() {
  it('Returns an object', function() {
    assert.equal(typeof(include), "object");
  });
});

module.exports = include;
