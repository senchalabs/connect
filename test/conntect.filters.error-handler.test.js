
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    'test defaults': function(){
        var server = helpers.run([
            { module: {
                handle: function(err, req, res, next){
                    next(new Error('keyboard cat!'));
                }
            }},
            { filter: 'error-handler' }
        ]);
        var req = server.request('GET', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal(500, res.statusCode, 'Test error-handler 500 status code');
                assert.equal('Internal Server Error', res.body, 'Test error-handler default response body');
            })
        })
        req.end();
    },
    
    'test showMessage': function(){
        var server = helpers.run([
            { module: {
                handle: function(err, req, res, next){
                    next(new Error('keyboard cat!'));
                }
            }},
            { filter: 'error-handler', param: { showMessage: true }}
        ]);
        var req = server.request('GET', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal(500, res.statusCode, 'Test error-handler 500 status code');
                assert.equal('Error: keyboard cat!', res.body, 'Test error-handler showMessage response body');
            })
        })
        req.end();
    },
    
    'test showStack': function(){
        var server = helpers.run([
            { module: {
                handle: function(err, req, res, next){
                    next(new Error('keyboard cat!'));
                }
            }},
            { filter: 'error-handler', param: { showStack: true }}
        ]);
        var req = server.request('GET', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal(500, res.statusCode, 'Test error-handler 500 status code');
                assert.ok(res.body.indexOf('Error: keyboard cat!') !== -1, 'Test error-handler showStack message');
                assert.ok(res.body.indexOf('lib/connect/index.js') !== -1, 'Test error-handler showStack stack trace');
            })
        })
        req.end();
    }
}