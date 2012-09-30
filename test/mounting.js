
var connect = require('../')
  , http = require('http');

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
    
      app.request()
      .get('/blog')
      .expect('blog', done);
    })

    it('should retain req.originalUrl', function(done){
      var app = connect();
    
      app.use('/blog', function(req, res){
        res.end(req.originalUrl);
      });
    
      app.request()
      .get('/blog/post/1')
      .expect('/blog/post/1', done);
    })

    it('should adjust req.url', function(done){
      var app = connect();
    
      app.use('/blog', function(req, res){
        res.end(req.url);
      });
    
      app.request()
      .get('/blog/post/1')
      .expect('/post/1', done);
    })

    it('should strip trailing slash', function(done){
      var blog = connect();
    
      blog.use(function(req, res){
        req.url.should.equal('/');
        res.end('blog');
      });
    
      app.use('/blog/', blog);
    
      app.request()
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

      app.request()
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
    
      app.request()
      .get('/blog')
      .expect('blog', done);
    })
  })

  it('should be case insensitive', function(done){
    var blog = http.createServer(function(req, res){
      req.url.should.equal('/');
      res.end('blog');
    });
  
    app.use('/blog', blog);
  
    app.request()
    .get('/BLog')
    .expect('blog', done);
  })
})
