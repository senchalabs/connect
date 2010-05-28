
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    'test urlencoded body': function(){
        var server = helpers.run([
            { filter: 'body-decoder' },
            { module: {
                handle: function(err, req, res){
                    assert.eql({ user: { name: 'tj' }}, req.body, 'Test body-decoder urlencoded req.body')
                    res.writeHead(200);
                    res.end();
                }
            }}
        ]);
        var req = server.request('POST', '/', { 'Content-Type': 'application/x-www-form-urlencoded' });
        req.write('user[name]=tj')
        req.end();
    },
    
    'test json body': function(){
        var server = helpers.run([
            { filter: 'body-decoder' },
            { module: {
                handle: function(err, req, res){
                    assert.eql({ user: { name: 'tj' }}, req.body, 'Test body-decoder json req.body')
                    res.writeHead(200);
                    res.end();
                }
            }}
        ]);
        var req = server.request('POST', '/', { 'Content-Type': 'application/json; charset=utf8' });
        req.write('{"user":{"name":"tj"}}')
        req.end();
    }
}