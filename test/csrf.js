var connect = require('../');

describe('csrf', function(){
  it('should work with a valid token', function(done){
    var app = connect();

    app.use(connect.cookieParser())
    app.use(connect.session({ secret: 'greg' }));
    app.use(connect.csrf());
    app.use(function(req, res){
      res.end(req.csrfToken() || 'none');
    });

    app.request()
    .get('/')
    .end(function(res){
      var token = res.body;

      app.request()
      .post('/')
      .set('Cookie', res.headers['set-cookie'][0])
      .set('X-CSRF-Token', token)
      .end(function(res){
        res.statusCode.should.equal(200)
        done();
      });
    });
  });

  it('should fail with an invalid token', function(done){
    var app = connect();

    app.use(connect.cookieParser());
    app.use(connect.session({ secret: 'greg' }));
    app.use(connect.csrf());
    app.use(function(req, res){
      res.end(req.csrfToken() || 'none');
    });

    app.request()
    .get('/')
    .end(function(res){
      app.request()
      .post('/')
      .set('Cookie', res.headers['set-cookie'][0])
      .set('X-CSRF-Token', '42')
      .end(function(res){
        res.statusCode.should.equal(403)
        done();
      });
    });
  });

  it('should fail with no token', function(done){
    var app = connect();

    app.use(connect.cookieParser());
    app.use(connect.session({ secret: 'greg' }));
    app.use(connect.csrf());
    app.use(function(req, res){
      res.end(req.csrfToken() || 'none');
    });

    app.request()
    .get('/')
    .end(function(res){
      app.request()
      .set('Cookie', res.headers['set-cookie'][0])
      .post('/')
      .end(function(res){
        res.statusCode.should.equal(403);
        done();
      });
    });
  });
});
