
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

Ext.test('Connect method-override', {
    test_valid_method: function(){
        var server = new connect.Server([
            { filter: 'body-decoder' },
            { filter: 'method-override' },
            { module: {
                handle: function(req, res){
                    assert.equal('PUT', req.method, 'Test method-override')
                    res.writeHead(200);
                    res.end();
                }
            }}
        ]).run();
        var req = server.request('POST', '/', { 'Content-Type': 'application/x-www-form-urlencoded' });
        req.write('_method=put');
        req.end();
    },
    
    test_invalid_method: function(){
        var server = new connect.Server([
            { filter: 'body-decoder' },
            { filter: 'method-override' },
            { module: {
                handle: function(req, res){
                    assert.equal('POST', req.method, 'Test method-override invalid method')
                    res.writeHead(200);
                    res.end();
                }
            }}
        ]).run();
        var req = server.request('POST', '/', { 'Content-Type': 'application/x-www-form-urlencoded' });
        req.write('_method=foobar');
        req.end();
    }
})