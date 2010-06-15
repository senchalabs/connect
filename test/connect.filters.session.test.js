
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

// Stores

var MemoryStore = require('connect/filters/session/memory').MemoryStore;
var CookieStore = require('connect/filters/session/cookie').CookieStore;

module.exports = {
    'test MemoryStore': function(){
        var n = 0;
        var server = helpers.run([
            { filter: 'cookie' },
            { filter: 'session', store: new MemoryStore },
            { module: {
                handle: function(req, res, next){
                    assert.ok(req.sessionStore, 'Test req.sessionStore')
                    switch (n++) {
                        case 0:
                            assert.eql(['id', 'lastAccess'], Object.keys(req.session),
                                'Test MemoryStore session initialization');
                            break;
                        case 1:
                            assert.eql(['id', 'lastAccess'], Object.keys(req.session),
                                'Test MemoryStore session initialization with invalid sid');
                            assert.ok(req.session.id !== '123123', 'Test MemoryStore sid regeneration');
                            break;
                        case 3:
                            break;
                    }
                    next();
                }
            }}
        ]);
        server.request('GET', '/').end();
        server.request('GET', '/', { 'Cookie': 'connect.sid=123123' }).end();
        
        var req = server.request('GET', '/');
        req.addListener('response', function(res){
            var setCookie = res.headers['set-cookie'];
            var sid = setCookie.replace('connect.sid=', '');
            assert.ok(setCookie.indexOf('connect.sid=') === 0, 'Test MemoryStore Set-Cookie header');
        });
        req.end();
        // server.request('GET', '/', { 'Cookie': 'connect.sid=' + sid }).end()
    }
}