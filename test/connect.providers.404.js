
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

Ext.test('Connect 404', {
    test: function(){
        var server = connect.run([]);
        var req = server.request('POST', '/', { buffer: true });
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.strictEqual(404, res.statusCode, 'Test 404 provider status code');
                assert.equal('Not Found', res.body, 'Test 404 response body');
                assert.equal('text/plain', res.headers['content-type'], 'Test 404 Content-Type');
            })
        })
        req.end();
    }
})