
/**
 * Module dependencies.
 */

var connect = require('connect')
  , should = require('should')
  , assert = require('assert')
  , http = require('http');

module.exports = {
  'test version': function(){
    connect.version.should.match(/^\d+\.\d+\.\d+$/);
  },

  'test use()': function(){
    var app = connect.createServer();

    app.use('/blog', function(req, res){
      res.end('blog');
    });

    var ret = app.use(
      function(req, res){
        res.end('default');
      }
    );

    ret.should.equal(app);

    assert.response(app,
      { url: '/' },
      { body: 'default', status: 200 });

    assert.response(app,
      { url: '/blog' },
      { body: 'blog', status: 200 });
  },
  
  'test path matching': function(){
    var n = 0
      , app = connect.createServer();

    app.use('/hello/world', function(req, res, next){
      switch (++n) {
        case 1:
        case 2:
          req.url.should.equal('/');
          break;
        case 3:
          req.originalUrl.should.equal('/hello/world/and/more/segments');
          req.url.should.equal('/and/more/segments');
          break;
        case 4:
          req.url.should.equal('/images/foo.png?with=query&string');
          break;
      }

      res.end('hello world');
    });

    app.use('/hello', function(req, res, next){
      res.end('hello');
    });

    assert.response(app,
      { url: '/hello' },
      { body: 'hello' });
    
    assert.response(app,
      { url: '/hello/' },
      { body: 'hello' });

    assert.response(app,
      { url: '/hello/world' },
      { body: 'hello world' });

    assert.response(app,
      { url: '/hello/world/' },
      { body: 'hello world' });

    assert.response(app,
      { url: '/hello/world/and/more/segments' },
      { body: 'hello world' });

    assert.response(app,
      { url: '/hello/world/images/foo.png?with=query&string' },
      { body: 'hello world' });
  },
  
  'test unmatched path': function(){
    var app = connect.createServer();

    assert.response(app,
      { url: '/' },
      { body: 'Cannot GET /', status: 404 });

    assert.response(app,
      { url: '/foo', method: 'POST' },
      { body: 'Cannot POST /foo', status: 404 });
  },
  
  'test error handling': function(){
    var calls = 0;
    var app = connect.createServer(
      function(req, res, next){
        // Pass error
        next(new Error('lame'));
      },
      function(err, req, res, next){
        ++calls;
        err.should.be.an.instanceof(Error);
        req.should.be.a('object');
        res.should.be.a('object');
        next.should.be.a('function');
        req.body = err.message;
        next(err);
      },
      function(err, req, res, next){
        ++calls;
        err.should.be.an.instanceof(Error);
        req.should.be.a('object');
        res.should.be.a('object');
        next.should.be.a('function');
        // Recover exceptional state
        next();
      },
      function(req, res, next){
        res.end(req.body);
      },
      connect.errorHandler()
    );

    assert.response(app,
      { url: '/' },
      { body: 'lame', status: 200 },
      function(){
        calls.should.equal(2);
      });
  },
  // 
  // 'test catch error': function(){
  //     var server = helpers.run(
  //         function(req, res, next){
  //             doesNotExist();
  //         }
  //     );
  // 
  //     var req = server.request('GET', '/');
  //     req.buffer = true;
  //     req.addListener('response', function(res){
  //         res.addListener('end', function(){
  //             assert.equal(500, res.statusCode, 'Test 500 by default on exception');
  //         });
  //     });
  //     req.end();
  // },
  // 
  // 'test mounting': function(){
  //     var helloWorldServer = connect.createServer();
  //     helloWorldServer.use('/world', function(req, res){
  //         assert.equal('/hello', helloWorldServer.route);
  //         res.writeHead(200);
  //         res.end('hello world');
  //     });
  // 
  //     var server = helpers.run();
  //     server.use('/hello', helloWorldServer);
  //     server.use('/hello', function(req, res){
  //         res.writeHead(200);
  //         res.end('hello');
  //     });
  // 
  //     server.assertResponse('GET', '/hello/world', 200, 'hello world', 'Test mounting /hello/world');
  //     server.assertResponse('GET', '/hello', 200, 'hello', 'Test mounting /hello');
  // },
  // 
  // 'test connect as middleware': function(){
  //     var inner = connect.createServer();
  //     inner.use('/inner', function(req, res){
  //         if (req.method === 'POST') {
  //             res.writeHead(200);
  //             res.end('inner stack');
  //         } else {
  //             next();
  //         }
  //     });
  // 
  //     var middle = connect.createServer(inner);
  //     middle.use('/', function(req, res, next){
  //         if (req.method === 'POST') {
  //             res.writeHead(200);
  //             res.end('middle stack');
  //         } else {
  //             next();
  //         }
  //     });
  // 
  //     var server = helpers.run(middle);
  //     server.use('/outer', function(req, res){
  //         res.writeHead(200);
  //         res.end('outer stack');
  //     });
  // 
  //     server.assertResponse('GET', '/outer', 200, 'outer stack', 'Test outer stack');
  //     server.assertResponse('POST', '/', 200, 'middle stack', 'Test middle stack');
  //     server.assertResponse('POST', '/inner', 200, 'inner stack', 'Test inner stack');
  //     server.assertResponse('GET', '/', 404, 'Cannot GET /', 'Test multiple stacks unmatched path');
  // }
};