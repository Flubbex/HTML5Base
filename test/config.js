var assert    = require('assert');
var config    = require("../config/app");

describe('config', function() {
  it('Returns an object', function() {
    assert.equal(typeof(config), "object");
  });
});

module.exports = config;
