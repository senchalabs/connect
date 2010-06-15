
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
            { provider: 'bounce-favicon' }
        ]);
        server.assertResponse('GET', '/favicon.ico', 404, '', 'Test favicon 404');
        server.assertResponse('GET', '/', 404, 'Cannot find /', 'Test favicon pass through');
    }
}