
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    test: function(){
        var server = helpers.run(
            connect.responseTime(),
            function(req, res){
                setTimeout(function(){
                    res.writeHead(200, {});
                    res.end();
                }, 20);
            }
        );

        var req = server.request('GET', '/');
        req.addListener('response', function(res){
            assert.ok(!isNaN(parseInt(res.headers['x-response-time'])), 'Test X-Response-Time header')
        });
        req.end();
    }
}