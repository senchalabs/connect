
process.env.NODE_ENV = 'test';

var connect = require('../');
var http = require('http');
var request = require('./support/http');

describe('app.use()', function(){
  var app;

  beforeEach(function(){
    app = connect();
  })

  describe('with a connect app', function(){
    it('should mount', function(done){
      var blog = connect();
    
      blog.use(function(req, res){
        req.url.should.equal('/');
        res.end('blog');
      });
    
      app.use('/blog', blog);
    
      request(app)
      .get('/blog')
      .expect('blog', done);
    })

    it('should retain req.originalUrl', function(done){
      var app = connect();
    
      app.use('/blog', function(req, res){
        res.end(req.originalUrl);
      });
    
      request(app)
      .get('/blog/post/1')
      .expect('/blog/post/1', done);
    })

    it('should adjust req.url', function(done){
      var app = connect();
    
      app.use('/blog', function(req, res){
        res.end(req.url);
      });
    
      request(app)
      .get('/blog/post/1')
      .expect('/post/1', done);
    })

    it('should ignore FQDN in search', function (done) {
      var app = connect();

      app.use('/proxy', function (req, res) {
        res.end(req.url);
      });

      request(app)
      .get('/proxy?url=http://example.com/blog/post/1')
      .expect('/?url=http://example.com/blog/post/1', done);
    });

    it('should adjust FQDN req.url', function(done){
      var app = connect();

      app.use('/blog', function(req, res){
        res.end(req.url);
      });

      request(app)
      .get('http://example.com/blog/post/1')
      .expect('http://example.com/post/1', done);
    })

    it('should adjust FQDN req.url with multiple handlers', function(done){
      var app = connect();

      app.use(function(req,res,next) {
        next();
      });

      app.use('/blog', function(req, res){
        res.end(req.url);
      });

      request(app)
      .get('http://example.com/blog/post/1')
      .expect('http://example.com/post/1', done);
    })

    it('should adjust FQDN req.url with multiple routed handlers', function(done) {
      var app = connect();
    
      app.use('/blog', function(req,res,next) {       
        next();
      });
      app.use('/blog', function(req, res) {
        res.end(req.url);
      });

      request(app)
      .get('http://example.com/blog/post/1')
      .expect('http://example.com/post/1', done);
    })

    it('should strip trailing slash', function(done){
      var blog = connect();
    
      blog.use(function(req, res){
        req.url.should.equal('/');
        res.end('blog');
      });
    
      app.use('/blog/', blog);
    
      request(app)
      .get('/blog')
      .expect('blog', done);
    })

    it('should set .route', function(){
      var blog = connect();
      var admin = connect();
      app.use('/blog', blog);
      blog.use('/admin', admin);
      app.route.should.equal('/');
      blog.route.should.equal('/blog');
      admin.route.should.equal('/admin');
    })

    it('should not add trailing slash to req.url', function(done) {
      var app = connect();

      app.use('/admin', function(req, res, next) {
        next();
      });

      app.use(function(req, res, next) {
        res.end(req.url);
      });

      request(app)
      .get('/admin')
      .expect('/admin', done);
    })
  })

  describe('with a node app', function(){
    it('should mount', function(done){
      var blog = http.createServer(function(req, res){
        req.url.should.equal('/');
        res.end('blog');
      });
    
      app.use('/blog', blog);
    
      request(app)
      .get('/blog')
      .expect('blog', done);
    })
  })

  it('should be case insensitive (lower-case route, mixed-case request)', function(done){
    var blog = http.createServer(function(req, res){
      req.url.should.equal('/');
      res.end('blog');
    });
  
    app.use('/blog', blog);
  
    request(app)
    .get('/BLog')
    .expect('blog', done);
  })

  it('should be case insensitive (mixed-case route, lower-case request)', function(done){
    var blog = http.createServer(function(req, res){
      req.url.should.equal('/');
      res.end('blog');
    });

    app.use('/BLog', blog);

    request(app)
    .get('/blog')
    .expect('blog', done);
  })

  it('should be case insensitive (mixed-case route, mixed-case request)', function(done){
    var blog = http.createServer(function(req, res){
      req.url.should.equal('/');
      res.end('blog');
    });

    app.use('/BLog', blog);

    request(app)
    .get('/blOG')
    .expect('blog', done);
  })
})
