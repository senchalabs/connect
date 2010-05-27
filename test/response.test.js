
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

Ext.test('ServerResponse', {
    test_error: function(){
        var server = connect.run([
            ['/', 'providers/error']
        ]);
        var req = server.request('POST', '/', { buffer: true });
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.strictEqual(500, res.statusCode, 'Test ServerResponse#error() status code');
                assert.equal('fail', res.body, 'Test ServerResponse#error() body');
            })
        })
        req.end();
    }
})