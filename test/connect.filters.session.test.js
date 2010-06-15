
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
        var n = 0, sid;
        var server = helpers.run([
            { filter: 'cookie' },
            { filter: 'session', store: new MemoryStore({ reapInterval: -1 }) },
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
                            assert.notEqual('123123', req.session.id, 'Test MemoryStore sid regeneration');
                            break;
                        case 2:
                            lastAccess = req.session.lastAccess;
                            break;
                        case 3:
                            assert.equal(sid, req.session.id, 'Test MemoryStore persistence');
                            assert.notEqual(lastAccess, req.session.lastAccess, 'Test MemoryStore lastAccess update');
                            break;
                    }
                    next();
                }
            }}
        ]);
        
        server.pending = 4;
        server.request('GET', '/').end();
        server.request('GET', '/', { 'Cookie': 'connect.sid=123123' }).end();
        
        var req = server.request('GET', '/');
        req.addListener('response', function(res){
            var setCookie = res.headers['set-cookie'];
            sid = setCookie.match(/connect\.sid=([^;]+)/)[1];
            assert.ok(setCookie.indexOf('connect.sid=') === 0, 'Test MemoryStore Set-Cookie connect.sid');
            assert.ok(setCookie.indexOf('httpOnly') !== -1, 'Test MemoryStore Set-Cookie httpOnly');
            assert.ok(setCookie.indexOf('expires=') !== -1, 'Test MemoryStore Set-Cookie expires');
            server.request('GET', '/', { 'Cookie': 'connect.sid=' + sid }).end()
        });
        req.end();
    },
    
    'test CookieStore': function(){
        var n = 0;
        var server = helpers.run([
            { filter: 'cookie' },
            { filter: 'session', store: new CookieStore },
            { module: {
                handle: function(req, res, next){
                    assert.ok(req.sessionStore, 'Test req.sessionStore')
                    switch (n++) {
                        case 0:
                            assert.eql({}, req.session, 'Test CookieStore session initialization');
                            req.session.name = 'tj';
                            break;
                        case 1:
                            assert.eql({ name: 'tj' }, req.session, 'Test CookieStore session data')
                            break;
                    }
                    next();
                }
            }}
        ]);
        
        var req = server.request('GET', '/')
        req.addListener('response', function(res){
            var setCookie = res.headers['set-cookie'];
            assert.equal('connect.session=eyJuYW1lIjoidGoifQ%3D%3D; path=/; httpOnly', setCookie,
                'Test CookieStore Set-Cookie header');
        });
        req.end();
        
        server.request('GET', '/', { 'Cookie': 'connect.session=eyJuYW1lIjoidGoifQ%3D%3D' }).end();
    }
};