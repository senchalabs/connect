var connect = require('../');
var signature = require('cookie-signature')

describe('csrf', function(){
  it('should work with a valid token', function(done){
    var app = connect();

    app.use(connect.cookieParser())
    app.use(connect.session({ secret: 'greg' }));
    app.use(connect.bodyParser());
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
    app.use(connect.bodyParser());
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
    app.use(connect.bodyParser());
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

  it('should not warn when loading session with _csrf', function(done){
    var app = connect();
    var warn = console.warn;
    var warns = 0;

    // Old cookie that contains _csrf
    var val = 'j:' + JSON.stringify({ _csrf: 'blah' });
    var cookie = 's:' + signature.sign(val, 'greg');

    // Record warning count
    console.warn = function () { warns++ };

    app.use(connect.cookieParser());
    app.use(connect.cookieSession({ key: 'ses', secret: 'greg' }));
    app.use(connect.bodyParser());
    app.use(connect.csrf());
    app.use(function(req, res){
      res.end(req.csrfToken() || 'none');
    });

    app.request()
    .set('Cookie', 'ses=' + escape(cookie))
    .get('/')
    .end(function(res){
      console.warn = warn;
      warns.should.equal(0);
      done();
    });
  });
});
