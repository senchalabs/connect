
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
    
    'test catch error': function(){
        var server = helpers.run([
            { module: {
                handle: function(err, req, res, next){
                    doesNotExist();
                }
            }},
            { module: {
                handle: function(err, req, res, next){
                    assert.ok(err instanceof Error, 'Test catching of thrown exception in middleware');
                    assert.eql(['doesNotExist'], err.arguments, 'Test catching of thrown exception in middleware');
                    assert.equal('object', typeof req);
                    assert.equal('object', typeof res);
                    assert.equal('function', typeof next);
                    next(err);
                }
            }}
        ]);
        var req = server.request('GET', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal(500, res.statusCode, 'Test 500 status code with no error handler');
                assert.equal('Internal Server Error', res.body, 'Test Internal Server Error with no error handler');
            });
        });
        req.end();
    },
    
    'test connect as middleware': function(){
        var inner = connect.createServer([
            { module: {
                handle: function(err, req, res){
                    if (req.method === 'POST') {
                        res.writeHead(200);
                        res.end('inner stack');
                    } else {
                        next();
                    }
                }
            }, route: '/inner' }
        ]);
        var middle = connect.createServer([
            { module: inner },
            { module: {
                handle: function(err, req, res){
                    if (req.method === 'POST') {
                        res.writeHead(200);
                        res.end('middle stack');
                    } else {
                        next();
                    }
                }
            }}
        ]);
        var server = helpers.run([
            { module: middle },
            { module: {
                handle: function(err, req, res){
                    res.writeHead(200);
                    res.end('outer stack');
                }
            }, route: '/outer'}
        ]);
        
        // Outer stack
        
        var req = server.request('GET', '/outer');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('outer stack', res.body);
            });
        });
        req.end();
        
        // Middle stack
        
        var req = server.request('POST', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('middle stack', res.body);
            });
        });
        req.end();
        
        // Inner stack
        
        var req = server.request('POST', '/inner');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('inner stack', res.body);
            });
        });
        req.end();
        
        // Unmatched
        
        var req = server.request('GET', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal('Cannot find /', res.body);
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
                    // Implicitly pass all args again
                    next();
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