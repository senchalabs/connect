
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    test: function(){
        var server = helpers.run([
            { filter: 'cookie' },
            { module: require('./providers/echo') }
        ]);
    }
}