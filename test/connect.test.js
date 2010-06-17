
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
    
    'test basic middleware stack': function(){
        var server = helpers.run([
            { module: require('./filters/uppercase'), param: 1 },
            { module: {
                handle: function(req, res, next){
                    assert.equal('test', this.env && this.env.name, 'Test env available to layer instance');
                    next();
                }
            }},
            { module: require('./providers/echo') },
            
        ], { name: 'test' });
        assert.ok(server instanceof http.Server, 'Test Server instanceof http.Server')
        var setupArgs = require('./filters/uppercase').setupArgs;
        assert.equal('test', setupArgs[0].name, 'Test env passed to setup() as first arg');
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
    
    'test path matching': function(){
        var n = 0;
        var server = helpers.run([
            { module: {
                handle: function(req, res, next){
                    switch (++n) {
                        case 1:
                        case 2:
                            assert.equal('/', req.url, 'Test request url after matching a path');
                            break;
                        case 3:
                            assert.equal('/and/more/segments', 
                                req.url,
                                'Test request url after matching a path with additional segments');
                            break;
                        case 4:
                            assert.equal('/images/foo.png?with=query&string', 
                                req.url,
                                'Test request url after matching a path with query string');
                            break;
                    }
                    res.writeHead(200);
                    res.end('hello world');
                }
            }, route: '/hello/world' },
            { module: {
                handle: function(req, res, next){
                    res.writeHead(200);
                    res.end('hello');
                }
            }, route: '/hello' }
        ]);
        
        server.assertResponse('GET', '/hello', 200, 'hello', 'Test path matching /hello');
        server.assertResponse('GET', '/hello/', 200, 'hello', 'Test path matching /hello/');
        server.assertResponse('GET', '/hello/world', 200, 'hello world', 'Test path matching /hello/world');
        server.assertResponse('GET', '/hello/world/', 200, 'hello world', 'Test path matching /hello/world/');
        server.assertResponse('GET', '/hello/world/and/more/segments', 200, 'hello world', 'Test path matching /hello/world/and/more/segments');
        server.assertResponse('GET', '/hello/world/images/foo.png?with=query&string', 200, 'hello world', 'Test path matching /hello/world/images/foo.png?with=query&string');
    },
    
    'test unmatched path': function(){
        var server = helpers.run([]);
        server.assertResponse('GET', '/', 404, 'Cannot find /', 'Test unmatched path');
        server.assertResponse('GET', '/foo', 404, 'Cannot find /foo', 'Test unmatched path');
    },
    
    'test handleError': function(){
        var called = 0;
        var server = helpers.run([
            { module: {
                handle: function(req, res, next){
                    // Pass error
                    next(new Error('shitty deal'));
                }
            }},
            { module: {
                handleError: function(err, req, res, next){
                    ++called;
                    assert.ok(err instanceof Error, 'Test handleError() Error as first param');
                    assert.equal('object', typeof req);
                    assert.equal('object', typeof res);
                    assert.equal('function', typeof next);
                    req.body = err.message;
                    next(error);
                }
            }},
            { module: {
                handleError: function(err, req, res, next){
                    ++called;
                    assert.ok(err instanceof Error, 'Test handleError() next(error)');
                    assert.equal('object', typeof req);
                    assert.equal('object', typeof res);
                    assert.equal('function', typeof next);
                    // Recover exceptional state
                    next();
                }
            }},
            { module: {
                handle: function(req, res, next){
                    res.writeHead(200, {});
                    res.end(req.body);
                }
            }},
            { filter: 'error-handler' }
        ]);
        server.assertResponse('GET', '/', 200, 'shitty deal', 'Test handleError next()', function(){
            var expected = 2;
            assert.equal(expected, called, 'Test handleError calls, expected ' + expected + ' but got ' + called); 
        });
    },
    
    'test catch error': function(){
        var server = helpers.run([
            { module: {
                handle: function(req, res, next){
                    doesNotExist();
                }
            }}
        ]);
        
        var req = server.request('GET', '/');
        req.buffer = true;
        req.addListener('response', function(res){
            res.addListener('end', function(){
                assert.equal(500, res.statusCode, 'Test 500 by default on exception');
            });
        });
        req.end();
    },
    
    'test mounting': function(){
        var world = connect.createServer([
            { module: {
                handle: function(req, res){
                    res.writeHead(200);
                    res.end('hello world');
                }
            }, route: '/world' }
        ]);
        
        var server = helpers.run([
            { module: world, route: '/hello' },
            { module: {
                handle: function(req, res){
                    res.writeHead(200);
                    res.end('hello');
                }
            }, route: '/hello' }
        ]);
        
        server.assertResponse('GET', '/hello/world', 200, 'hello world', 'Test mounting /hello/world');
        server.assertResponse('GET', '/hello', 200, 'hello', 'Test mounting /hello');
    },
    
    'test connect as middleware': function(){
        var inner = connect.createServer([
            { module: {
                handle: function(req, res){
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
                handle: function(req, res, next){
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
                handle: function(req, res){
                    res.writeHead(200);
                    res.end('outer stack');
                }
            }, route: '/outer'}
        ]);
        
        server.assertResponse('GET', '/outer', 200, 'outer stack', 'Test outer stack');
        server.assertResponse('POST', '/', 200, 'middle stack', 'Test middle stack');
        server.assertResponse('POST', '/inner', 200, 'inner stack', 'Test inner stack');
        server.assertResponse('GET', '/', 404, 'Cannot find /', 'Test multiple stacks unmatched path');
    },
    
    'test next()': function(){
        var server = helpers.run([
            { module: {
                handle: function(req, res, next){
                    next();
                }
            }},
            { module: {
                handle: function(req, res, next){
                    assert.equal('object', typeof req);
                    assert.equal('object', typeof res);
                    assert.equal('function', typeof next);
                    next();
                }
            }}
        ]);
        server.request('GET', '/').end();
    }
}