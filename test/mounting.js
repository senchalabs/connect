
var assert = require('assert');
var connect = require('..');
var http = require('http');
var request = require('supertest');

describe('app.use()', function(){
  var app;

  beforeEach(function(){
    app = connect();
  });

  it('should match all paths with "/"', function (done) {
    app.use('/', function (req, res) {
      res.end(req.url);
    });

    request(app)
      .get('/blog')
      .expect(200, '/blog', done)
  });

  it('should match full path', function (done) {
    app.use('/blog', function (req, res) {
      res.end(req.url);
    });

    request(app)
      .get('/blog')
      .expect(200, '/', done)
  });

  it('should match left-side of path', function (done) {
    app.use('/blog', function (req, res) {
      res.end(req.url);
    });

    request(app)
      .get('/blog/article/1')
      .expect(200, '/article/1', done)
  });

  it('should match up to dot', function (done) {
    app.use('/blog', function (req, res) {
      res.end(req.url)
    })

    request(app)
      .get('/blog.json')
      .expect(200, done)
  })

  it('should not match shorter path', function (done) {
    app.use('/blog-o-rama', function (req, res) {
      res.end(req.url);
    });

    request(app)
      .get('/blog')
      .expect(404, done)
  });

  it('should not end match in middle of component', function (done) {
    app.use('/blog', function (req, res) {
      res.end(req.url);
    });

    request(app)
      .get('/blog-o-rama/article/1')
      .expect(404, done)
  });

  it('should be case insensitive (lower-case route, mixed-case request)', function(done){
    var blog = http.createServer(function(req, res){
      assert.equal(req.url, '/');
      res.end('blog');
    });

    app.use('/blog', blog);

    request(app)
      .get('/BLog')
      .expect('blog', done)
  });

  it('should be case insensitive (mixed-case route, lower-case request)', function(done){
    var blog = http.createServer(function(req, res){
      assert.equal(req.url, '/');
      res.end('blog');
    });

    app.use('/BLog', blog);

    request(app)
      .get('/blog')
      .expect('blog', done)
  });

  it('should be case insensitive (mixed-case route, mixed-case request)', function(done){
    var blog = http.createServer(function(req, res){
      assert.equal(req.url, '/');
      res.end('blog');
    });

    app.use('/BLog', blog);

    request(app)
      .get('/blOG')
      .expect('blog', done)
  });

  it('should ignore fn.arity > 4', function(done){
    var invoked = [];

    app.use(function(req, res, next, _a, _b){
      invoked.push(0)
      next();
    });
    app.use(function(req, res, next){
      invoked.push(1)
      next(new Error('err'));
    });
    app.use(function(err, req, res, next){
      invoked.push(2);
      res.end(invoked.join(','));
    });

    request(app)
      .get('/')
      .expect(200, '1,2', done)
  });

  describe('with a connect app', function(){
    it('should mount', function(done){
      var blog = connect();

      blog.use(function(req, res){
        assert.equal(req.url, '/');
        res.end('blog');
      });

      app.use('/blog', blog);

      request(app)
        .get('/blog')
        .expect(200, 'blog', done)
    });

    it('should retain req.originalUrl', function(done){
      var app = connect();

      app.use('/blog', function(req, res){
        res.end(req.originalUrl);
      });

      request(app)
        .get('/blog/post/1')
        .expect(200, '/blog/post/1', done)
    });

    it('should adjust req.url', function(done){
      app.use('/blog', function(req, res){
        res.end(req.url);
      });

      request(app)
        .get('/blog/post/1')
        .expect(200, '/post/1', done)
    });

    it('should strip trailing slash', function(done){
      var blog = connect();

      blog.use(function(req, res){
        assert.equal(req.url, '/');
        res.end('blog');
      });

      app.use('/blog/', blog);

      request(app)
        .get('/blog')
        .expect('blog', done)
    });

    it('should set .route', function(){
      var blog = connect();
      var admin = connect();
      app.use('/blog', blog);
      blog.use('/admin', admin);
      assert.equal(app.route, '/');
      assert.equal(blog.route, '/blog');
      assert.equal(admin.route, '/admin');
    });

    it('should not add trailing slash to req.url', function(done) {
      app.use('/admin', function(req, res, next) {
        next();
      });

      app.use(function(req, res, next) {
        res.end(req.url);
      });

      request(app)
        .get('/admin')
        .expect('/admin', done)
    })
  })

  describe('with a node app', function(){
    it('should mount', function(done){
      var blog = http.createServer(function(req, res){
        assert.equal(req.url, '/');
        res.end('blog');
      });

      app.use('/blog', blog);

      request(app)
        .get('/blog')
        .expect('blog', done)
    });
  });

  describe('error handling', function(){
    it('should send errors to airty 4 fns', function(done){
      app.use(function(req, res, next){
        next(new Error('msg'));
      })
      app.use(function(err, req, res, next){
        res.end('got error ' + err.message);
      });

      request(app)
        .get('/')
        .expect('got error msg', done)
    })

    it('should skip to non-error middleware', function(done){
      var invoked = false;

      app.use(function(req, res, next){
        next(new Error('msg'));
      })
      app.use(function(req, res, next){
        invoked = true;
        next();
      });
      app.use(function(err, req, res, next){
        res.end(invoked ? 'invoked' : err.message);
      });

      request(app)
        .get('/')
        .expect(200, 'msg', done)
    })

    it('should start at error middleware declared after error', function(done){
      var invoked = false;

      app.use(function(err, req, res, next){
        res.end('fail: ' + err.message);
      });
      app.use(function(req, res, next){
        next(new Error('boom!'));
      });
      app.use(function(err, req, res, next){
        res.end('pass: ' + err.message);
      });

      request(app)
        .get('/')
        .expect(200, 'pass: boom!', done)
    })

    it('should stack error fns', function(done){
      app.use(function(req, res, next){
        next(new Error('msg'));
      })
      app.use(function(err, req, res, next){
        res.setHeader('X-Error', err.message);
        next(err);
      });
      app.use(function(err, req, res, next){
        res.end('got error ' + err.message);
      });

      request(app)
        .get('/')
        .expect('X-Error', 'msg')
        .expect(200, 'got error msg', done)
    })

    it('should invoke error stack even when headers sent', function(done){
      app.use(function(req, res, next){
        res.end('0');
        next(new Error('msg'));
      });
      app.use(function(err, req, res, next){
        done();
      });

      request(app)
        .get('/')
        .end(function () {})
    })
  })
});
