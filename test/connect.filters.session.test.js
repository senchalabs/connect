
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
                    }
                    next();
                }
            }}
        ]);
        server.request('GET', '/').end();
        server.request('GET', '/', { 'Cookie': 'connect.sid=123123' }).end();
    }
}