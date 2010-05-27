
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

Ext.test('Connect 404', {
    test_default: function(){
        var server = connect.run([]);
        var req = server.request('POST', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.strictEqual(404, res.statusCode, 'Test 404 provider status code');
                assert.equal('Not Found', res.body, 'Test 404 response body');
                assert.equal('text/plain', res.headers['content-type'], 'Test 404 Content-Type');
            })
        })
        req.end();
    },
    
    test_custom_message: function(){
        var server = connect.run([
            { provider: '404', param: 'Resource cannot be found' }
        ]);
        var req = server.request('POST', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('Resource cannot be found', res.body, 'Test 404 provider custom error message');
            })
        })
        req.end();
    }
})