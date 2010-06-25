
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    'test urlencoded body': function(){
        var server = helpers.run(
            connect.bodyDecoder(),
            function(req, res){
                assert.eql({ user: { name: 'tj' }}, req.body, 'Test body-decoder urlencoded req.body');
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('POST', '/', { 'Content-Type': 'application/x-www-form-urlencoded' });
        req.write('user[name]=tj');
        req.end();
    },

    'test json body': function(){
        var server = helpers.run(
            connect.bodyDecoder(),
            function(req, res){
                assert.eql({ user: { name: 'tj' }}, req.body, 'Test body-decoder json req.body');
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('POST', '/', { 'Content-Type': 'application/json; charset=utf8' });
        req.write('{"user":{"name":"tj"}}');
        req.end();
    },

    'test empty body': function(){
        var server = helpers.run(
            connect.bodyDecoder(),
            function(req, res){
                assert.eql({}, req.body, 'Test body-decoder empty req.body');
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('POST', '/', { 'Content-Type': 'application/json; charset=utf8' });
        req.write('');
        req.end();
    },

    'test invalid body': function(){
        var server = helpers.run(
            connect.bodyDecoder(),
            function(err, req, res, next){
                assert.equal('unexpected_eos', err.type, 'Test body-decoder invalid json error');
                assert.equal('{"user":{"name":"tj"', req.rawBody, 'Test body-decoder req.rawBody');
                assert.strictEqual(undefined, req.body, 'Test body-decoder invalid json req.body');
                res.writeHead(200);
                res.end();
            }
        );
        var req = server.request('POST', '/', { 'Content-Type': 'application/json' });
        req.write('{"user":{"name":"tj"');
        req.end();
    }
}