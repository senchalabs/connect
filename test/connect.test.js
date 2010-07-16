
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

    'test use()': function(){
        var server = helpers.run();

        server.use('/blog', function(req, res){
            res.writeHead(200, {});
            res.end('blog');
        });

        var ret = server.use(
            function(req, res){
                res.writeHead(200, {});
                res.end('wahoo');
            }
        );

        assert.equal(server, ret, 'Test Server#use() returns server for chaining');
        server.assertResponse('GET', '/', 200, 'wahoo');
        server.assertResponse('GET', '/blog', 200, 'blog');
    },

    'test path matching': function(){
        var n = 0;
        var server = helpers.run();

        server.use('/hello/world', function(req, res, next){
            switch (++n) {
                case 1:
                case 2:
                    assert.equal('/', req.url, 'Test request url after matching a path');
                    break;
                case 3:
                    assert.equal('/hello/world/and/more/segments',
                        req.originalUrl,
                        'Test request originalUrl');
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
        });

        server.use('/hello', function(req, res, next){
            res.writeHead(200);
            res.end('hello');
        });

        server.assertResponse('GET', '/hello', 200, 'hello', 'Test path matching /hello');
        server.assertResponse('GET', '/hello/', 200, 'hello', 'Test path matching /hello/');
        server.assertResponse('GET', '/hello/world', 200, 'hello world', 'Test path matching /hello/world');
        server.assertResponse('GET', '/hello/world/', 200, 'hello world', 'Test path matching /hello/world/');
        server.assertResponse('GET', '/hello/world/and/more/segments', 200, 'hello world', 'Test path matching /hello/world/and/more/segments');
        server.assertResponse('GET', '/hello/world/images/foo.png?with=query&string', 200, 'hello world', 'Test path matching /hello/world/images/foo.png?with=query&string');
    },

    'test unmatched path': function(){
        var server = helpers.run();
        server.assertResponse('GET', '/', 404, 'Cannot GET /', 'Test unmatched path');
        server.assertResponse('GET', '/foo', 404, 'Cannot GET /foo', 'Test unmatched path');
    },

    'test handleError': function(){
        var called = 0;
        var server = helpers.run(
            function(req, res, next){
                // Pass error
                next(new Error('shitty deal'));
            },
            function(err, req, res, next){
                ++called;
                assert.ok(err instanceof Error, 'Test handleError() Error as first param');
                assert.equal('object', typeof req);
                assert.equal('object', typeof res);
                assert.equal('function', typeof next);
                req.body = err.message;
                next(err);
            },
            function(err, req, res, next){
                ++called;
                assert.ok(err instanceof Error, 'Test handleError() next(error)');
                assert.equal('object', typeof req);
                assert.equal('object', typeof res);
                assert.equal('function', typeof next);
                // Recover exceptional state
                next();
            },
            function(req, res, next){
                res.writeHead(200, {});
                res.end(req.body);
            },
            connect.errorHandler()
        );
        server.assertResponse('GET', '/', 200, 'shitty deal', 'Test handleError next()', function(){
            var expected = 2;
            assert.equal(expected, called, 'Test handleError calls, expected ' + expected + ' but got ' + called);
        });
    },

    'test catch error': function(){
        var server = helpers.run(
            function(req, res, next){
                doesNotExist();
            }
        );

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
        var helloWorldServer = connect.createServer();
        helloWorldServer.use('/world', function(req, res){
            res.writeHead(200);
            res.end('hello world');
        });

        var server = helpers.run();
        server.use('/hello', helloWorldServer);
        server.use('/hello', function(req, res){
            res.writeHead(200);
            res.end('hello');
        });

        server.assertResponse('GET', '/hello/world', 200, 'hello world', 'Test mounting /hello/world');
        server.assertResponse('GET', '/hello', 200, 'hello', 'Test mounting /hello');
    },

    'test connect as middleware': function(){
        var inner = connect.createServer();
        inner.use('/inner', function(req, res){
            if (req.method === 'POST') {
                res.writeHead(200);
                res.end('inner stack');
            } else {
                next();
            }
        });

        var middle = connect.createServer(inner);
        middle.use('/', function(req, res, next){
            if (req.method === 'POST') {
                res.writeHead(200);
                res.end('middle stack');
            } else {
                next();
            }
        });

        var server = helpers.run(middle);
        server.use('/outer', function(req, res){
            res.writeHead(200);
            res.end('outer stack');
        });

        server.assertResponse('GET', '/outer', 200, 'outer stack', 'Test outer stack');
        server.assertResponse('POST', '/', 200, 'middle stack', 'Test middle stack');
        server.assertResponse('POST', '/inner', 200, 'inner stack', 'Test inner stack');
        server.assertResponse('GET', '/', 404, 'Cannot GET /', 'Test multiple stacks unmatched path');
    }
}