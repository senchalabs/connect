
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

    it('should set .route', function(){
      var blog = connect();
      var admin = connect();
      app.use('/blog', blog);
      blog.use('/admin', admin);
      app.route.should.equal('/');
      blog.route.should.equal('/blog');
      admin.route.should.equal('/admin');
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
  
})
