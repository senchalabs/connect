
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    'test valid http method': function(){
        var server = helpers.run(
            connect.bodyDecoder(),
            connect.methodOverride(),
            function(req, res){
                assert.equal('PUT', req.method, 'Test method-override');
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('POST', '/', { 'Content-Type': 'application/x-www-form-urlencoded' });
        req.write('_method=put');
        req.end();
    },

    'test invalid http method': function(){
        var server = helpers.run(
            connect.bodyDecoder(),
            connect.methodOverride(),
            function(req, res){
                assert.equal('POST', req.method, 'Test method-override invalid method');
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('POST', '/', { 'Content-Type': 'application/x-www-form-urlencoded' });
        req.write('_method=foobar');
        req.end();
    },

    'test custom key': function(){
        var server = helpers.run(
            connect.bodyDecoder(),
            connect.methodOverride('__method__'),
            function(req, res){
                assert.equal('PUT', req.method, 'Test method-override custom key');
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('POST', '/', { 'Content-Type': 'application/x-www-form-urlencoded' });
        req.write('__method__=put');
        req.end();
    },
    
    'test X-HTTP-Method-Override header': function(){
        var server = helpers.run(
            connect.methodOverride(),
            function(req, res){
                assert.equal('PUT', req.method, 'Test X-HTTP-Method-Override');
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('POST', '/', { 'X-HTTP-Method-Override': 'PUT' });
        req.end();
    }
}