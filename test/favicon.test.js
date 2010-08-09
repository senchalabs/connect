
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    'test headers': function(){
        var server = helpers.run(connect.favicon());
        var req = server.request('GET', '/favicon.ico');
        req.buffer = true;
        req.addListener('response', function(res){
            assert.equal('image/x-icon', res.headers['content-type']);
            assert.ok(res.headers['content-length'], 'Test favicon Content-Length');
        });
        req.end();
    },
    
    'test custom favicon': function(){
        var server = helpers.run(
            connect.favicon(__dirname + '/../lib/connect/public/favicon.ico')
        );
        server.assertResponse('GET', '/favicon.ico', 200);
    }
}
