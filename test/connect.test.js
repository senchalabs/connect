
/**
 * Module dependencies.
 */

var connect = require('connect'),
    helpers = require('./helpers'),
    assert = require('assert'),
    http = require('http');

module.exports = {
    'test version': function(){
        assert.ok(/^\d+\.\d+\.\d+$/.test(connect.version), 'Test framework version format');
    },
    
    'test configuration': function(){
        assert.equal('localhost', connect.env.hostname, 'Test "development" environment config loaded by default');
        assert.equal('development', connect.env.name, 'Test env.name');
    },
    
    'test basic middleware stack': function(){
        var server = helpers.run([
            { module: require('filters/uppercase'), param: 1 },
            { module: require('providers/echo') }
        ]);
        assert.ok(server instanceof http.Server, 'Test Server instanceof http.Server')
        var setupArgs = require('filters/uppercase').setupArgs;
        assert.equal('development', setupArgs[0].name, 'Test env passed to setup() as first arg');
        assert.eql([1], Array.prototype.slice.call(setupArgs, 1), 'Test remaining setup() args');
        var req = server.request('POST', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('HELLO WORLD', res.body, 'Test provider response');
            });
        });
        req.write('hello world');
        req.end();
    },
    
    'test unmatched path': function(){
        var server = helpers.run([]);
        var req = server.request('GET', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal(404, res.statusCode, 'Test 404 on unmatched path');
                assert.equal('Cannot find /', res.body, 'Test response body of unmatched path');
            });
        });
        req.end();
    },
    
    'test next()': function(){
        var server = helpers.run([
            { module: {
                handle: function(err, req, res, next){
                    // Implicit passing of args
                    next();
                }
            }},
            { module: {
                handle: function(err, req, res, next){
                    assert.strictEqual(null, err);
                    assert.equal('object', typeof req);
                    assert.equal('object', typeof res);
                    assert.equal('function', typeof next);
                    // Explicit passing of arg 1 
                    next(null);
                }
            }},
            { module: {
                handle: function(err, req, res, next){
                    assert.strictEqual(null, err);
                    assert.equal('object', typeof req);
                    assert.equal('object', typeof res);
                    assert.equal('function', typeof next);
                    // Explicit passing of arg 1 
                    next(false);
                }
            }},
            { module: {
                handle: function(err, req, res, next){
                    assert.strictEqual(false, err);
                    assert.equal('object', typeof req);
                    assert.equal('object', typeof res);
                    assert.equal('function', typeof next);
                    // Explicit passing of arg 1 and 2
                    next(null, { faux: 'request' });
                }
            }},
            { module: {
                handle: function(err, req, res){
                    assert.strictEqual(null, err);
                    assert.eql({ faux: 'request' }, req);
                    res.writeHead(200);
                    res.end();
                }
            }},
        ]);
        server.request('GET', '/').end();
    }
}