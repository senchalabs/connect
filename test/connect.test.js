
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
  
  'test catch error': function(){
    var app = connect.createServer(
      function(req, res, next){
        doesNotExist();
      }
    );

    assert.response(app,
      { url: '/' },
      { status: 500 });
  },
  
  'test mounting': function(){
    var app = connect.createServer();

    app.use('/', function(req, res){
      // TODO: should inherit parent's /hello
      // to become /hello/world/view
      app.route.should.equal('/world/view');
      res.end('viewing hello world');
    });

    var app1 = connect.createServer();
    app1.use('/world/view', app);
    app1.use('/world', function(req, res){
      app1.route.should.equal('/hello');
      res.end('hello world');
    });

    var app2 = connect.createServer();
    app2.use('/hello', app1);
    app2.use('/hello', function(req, res){
      app2.route.should.equal('/');
      res.end('hello');
    });

    assert.response(app2,
      { url: '/hello/world/view' },
      { body: 'viewing hello world' });

    assert.response(app2,
      { url: '/hello/world' },
      { body: 'hello world' });

    assert.response(app2,
      { url: '/hello' },
      { body: 'hello' });
  },
  
  'test mounting http.Server': function(){
    var app = connect.createServer()
      , world = http.createServer(function(req, res){
        res.end('world');
      });

    app.use('/hello/', world);

    assert.response(app,
      { url: '/hello' },
      { body: 'world' });
  }
};