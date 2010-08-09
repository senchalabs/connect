
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    'test defaults': function(){
        var server = helpers.run(connect.favicon());
        server.assertResponse('GET', '/favicon.ico', 200);
    },
    
    'test custom favicon': function(){
        var server = helpers.run(
            connect.favicon(__dirname + '/../lib/connect/public/favicon.ico')
        );
        server.assertResponse('GET', '/favicon.ico', 200);
    }
}
