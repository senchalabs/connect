
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

// Session

var Session = require('connect/middleware/session/session');

// Stores

var MemoryStore = require('connect/middleware/session/memory');

module.exports = {
    'test Session() cast': function(){
        var sess = Session({ id: '123', lastAccess: 123 });
        assert.ok(sess instanceof Session, 'Test Session() cast');
        assert.equal('123', sess.id);
        assert.equal(123, sess.lastAccess);
    },
    
    'test MemoryStore': function(){
        var n = 0, sid;
        var server = helpers.run(
            connect.cookieDecoder(),
            connect.session({ store: new MemoryStore({ reapInterval: -1 }) }),
            function(req, res, next){
                assert.ok(req.sessionStore, 'Test req.sessionStore');
                assert.ok(req.sessionHash, 'Test req.sessionHash');
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
                    case 4:
                        assert.notEqual(sid, req.session.id, 'Test MemoryStore User-Agent fingerprint');
                        break;
                    case 5:
                        req.sessionStore.destroy(req, function(err, destroyed){
                            assert.ok(!err);
                            assert.ok(destroyed, 'Test MemoryStore#destroy() when present');
                        });
                        break;
                    case 6:
                        req.sessionStore.destroy(req, function(err, destroyed){
                            assert.ok(!err);
                            assert.ok(!destroyed, 'Test MemoryStore#destroy()');
                        });
                        break;
                }
                next();
            }
        );

        server.pending = 7;
        server.request('GET', '/').end();
        server.request('GET', '/', { 'Cookie': 'connect.sid=123123' }).end();

        var req = server.request('GET', '/', { 'User-Agent': 'foo' });
        req.addListener('response', function(res){
            var setCookie = res.headers['set-cookie'];
            sid = setCookie.match(/connect\.sid=([^;]+)/)[1];
            assert.ok(setCookie.indexOf('connect.sid=') === 0, 'Test MemoryStore Set-Cookie connect.sid');
            assert.ok(setCookie.indexOf('httpOnly') !== -1, 'Test MemoryStore Set-Cookie httpOnly');
            assert.ok(setCookie.indexOf('expires=') !== -1, 'Test MemoryStore Set-Cookie expires');
            setTimeout(function(){
                server.request('GET', '/', { 'Cookie': 'connect.sid=' + sid, 'User-Agent': 'foo' }).end();
                server.request('GET', '/', { 'Cookie': 'connect.sid=' + sid, 'User-Agent': 'bar' }).end();
                server.request('GET', '/', { 'Cookie': 'connect.sid=' + sid, 'User-Agent': 'foo' }).end();
                server.request('GET', '/', { 'Cookie': 'connect.sid=' + sid, 'User-Agent': 'foo' }).end();
            }, 30);
        });
        req.end();
    }
};