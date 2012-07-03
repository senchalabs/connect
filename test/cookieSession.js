
var connect = require('../');

function sess(res) {
  return res.headers['set-cookie'][0];
}

function respond(req, res) {
  res.end();
}

// TODO: share some of the same tests

describe('connect.cookieSession()', function(){
  var app;

  beforeEach(function(){
    app = connect();
    app.use(connect.cookieParser());
    app.use(connect.cookieSession({ secret: 'some secret' }));
  })

  it('should default to a browser-session length cookie', function(done){
    var app = connect()
      .use(connect.cookieParser())
      .use(connect.cookieSession({ secret: 'keyboard cat' }))
      .use(function(req, res, next){
        res.end();
      });

    app.request()
    .get('/')
    .end(function(res){
      var cookie = res.headers['set-cookie'][0];
      cookie.should.not.include('expires');
      done();
    });
  })

  it('should persist json', function(done){
    app.use(function(req, res){
      req.session.count = req.session.count || 0;
      var n = req.session.count++;
      res.end('' + n);
    });

    app.request()
    .get('/')
    .end(function(res){
      res.body.should.equal('0');
      app.request()
      .get('/')
      .set('Cookie', sess(res))
      .end(function(res){
        res.body.should.equal('1');
        done();
      })
    })
  })

  it('should reset on null', function(done){
    var n = 0;

    app.use(function(req, res){
      switch (n++) {
        case 0:
          req.session.name = 'tobi';
          break;
        case 1:
          req.session = null;
          break;
      }

      res.setHeader('Foo', 'bar');
      res.end('wahoo');
    });

    app.request()
    .get('/')
    .end(function(res){
      sess(res).should.not.include('expires');
      app.request()
      .get('/')
      .set('Cookie', sess(res))
      .end(function(res){
        sess(res).should.include('expires=Thu, 01 Jan 1970 00:00:00 GMT');
        done();
      });
    })
  })

  it('should reset on invalid parse', function(done){
    var n = 0;

    app.use(function(req, res){
      switch (n++) {
        case 0:
          req.session.name = 'tobi';
          break;
        case 1:
          // the session should be blank now
          req.session.name.should.equal(null);
          break;
      }

      res.setHeader('Foo', 'bar');
      res.end('wahoo');
    });

    app.request()
    .get('/')
    .end(function(res){
      sess(res).should.not.include('expires');
      app.request()
      .get('/')
      .set('Cookie', sess(res).replace(';', 'foobar')) // make invalid session cookie
      .end(function(res){
        sess(res).should.not.include('expires');
        done();
      });
    })
  })

  describe('req.session.cookie', function(){
    it('should be a Cookie', function(done){
      app.use(function(req, res){
        req.session.cookie.constructor.name.should.equal('Cookie');
        res.end();
      });

      app.request()
      .get('/')
      .end(function(res){
        var cookie = sess(res);
        cookie.should.include('Path=/');
        cookie.should.include('HttpOnly');
        done();
      })
    })

    it('should manipulate the cookie', function(done){
      app.use(function(req, res){
        req.session.cookie.path = '/admin';
        req.session.cookie.httpOnly = false;
        res.end();
      });

      app.request()
      .get('/admin')
      .end(function(res){
        var cookie = sess(res);
        cookie.should.include('Path=/admin');
        cookie.should.not.include('HttpOnly');
        done();
      })
    })
  })

  describe('cookie option', function(){
    it('should override defaults', function(done){
      var app = connect();
      app.use(connect.cookieParser());
      app.use(connect.cookieSession({ secret: 'some secret', cookie: { httpOnly: false }}));

      app.use(function(req, res){
        res.end();
      });

      app.request()
      .get('/')
      .end(function(res){
        var cookie = sess(res);
        cookie.should.include('Path=/');
        cookie.should.not.include('HttpOnly');
        done();
      })
    })
  })

  describe('when modified', function(){
    it('should set-cookie', function(done){
      var n = 0;
      var app = connect()
        .use(connect.cookieParser())
        .use(connect.cookieSession({ secret: 'keyboard cat' }))
        .use(function(req, res, next){
          req.session.foo = ++n;
          res.end();
        });

      app.request()
      .get('/')
      .end(function(res){
        res.headers.should.have.property('set-cookie');

        app.request()
        .get('/')
        .set('Cookie', sess(res))
        .end(function(res){
          res.headers.should.have.property('set-cookie');
          done();
        });
      });
    })
  })

  describe('when un-modified', function(){
    it('should set-cookie only the initial time', function(done){
      var modify;

      var app = connect()
        .use(connect.cookieParser())
        .use(connect.cookieSession({ secret: 'keyboard cat' }))
        .use(function(req, res, next){
          if (modify) req.session.foo = 'bar';
          res.end();
      });

      app.request()
      .get('/')
      .end(function(res){
        res.headers.should.have.property('set-cookie');
        var cookie = sess(res);

        app.request()
        .get('/')
        .set('Cookie', cookie)
        .end(function(res){
          res.headers.should.not.have.property('set-cookie');

          app.request()
          .get('/')
          .set('Cookie', cookie)
          .end(function(res){
            res.headers.should.not.have.property('set-cookie');
            modify = true;

            app.request()
            .get('/')
            .set('Cookie', cookie)
            .end(function(res){
              res.headers.should.have.property('set-cookie');
              done();
            });
          });
        });
      });
    })
  })

  describe('when the pathname does not match cookie.path', function(){
    it('should not set-cookie', function(done){
      var app = connect()
        .use(connect.cookieParser())
        .use(connect.cookieSession({ secret: 'keyboard cat',cookie: { path: '/admin' }}))
        .use(function(req, res, next){
          req.session.foo = Math.random();
          res.end();
        });

      app.request()
      .get('/')
      .end(function(res){
        res.headers.should.not.have.property('set-cookie');
        done();
      });
    })
  })

  describe('when the pathname does match cookie.path', function(){
    it('should not set-cookie', function(done){
      var app = connect()
        .use(connect.cookieParser())
        .use(connect.cookieSession({ secret: 'keyboard cat', cookie: { path: '/admin' }}))
        .use(function(req, res, next){
          req.session.foo = Math.random();
          res.end();
        });

      app.request()
      .get('/admin/foo')
      .end(function(res){
        res.headers.should.have.property('set-cookie');
        done();
      });
    })
  })

  describe('.secure', function(){
    it('should not set-cookie when insecure', function(done){
      var app = connect()
        .use(connect.cookieParser())
        .use(connect.cookieSession({ secret: 'keyboard cat' }))
        .use(function(req, res, next){
          req.session.cookie.secure = true;
          res.end();
        });

      app.request()
      .get('/')
      .end(function(res){
        res.headers.should.not.have.property('set-cookie');
        done();
      });
    })
  })

  describe('proxy option', function(){
    describe('when enabled', function(){
      it('should trust X-Forwarded-Proto', function(done){
        var app = connect()
          .use(connect.cookieParser())
          .use(connect.cookieSession({ secret: 'keyboard cat', proxy: true, cookie: { secure: true }}))
          .use(respond);
  
        app.request()
        .get('/')
        .set('X-Forwarded-Proto', 'https')
        .end(function(res){
          res.headers.should.have.property('set-cookie');
          done();
        });
      })
    })
  
    describe('when disabled', function(){
      it('should not trust X-Forwarded-Proto', function(done){
        var app = connect()
          .use(connect.cookieParser())
          .use(connect.cookieSession({ secret: 'keyboard cat', cookie: { secure: true }}))
          .use(respond);
  
        app.request()
        .get('/')
        .set('X-Forwarded-Proto', 'https')
        .end(function(res){
          res.headers.should.not.have.property('set-cookie');
          done();
        });
      })
    })
  })

  // backwards compat test for signed cookies through the `cookieParser` middleware
  it('should support req.signedCookies', function(done){
    var app = connect()
      .use(connect.cookieParser('keyboard cat'))
      .use(connect.cookieSession())
      .use(function(req, res, next){
        req.session.count = req.session.count || 0;
        var body = '' + req.session.count++;
        res.setHeader('Content-Length', body.length);
        res.end(body);
      });

    app.request()
    .get('/')
    .end(function(res){
      res.headers.should.have.property('set-cookie');

      app.request()
      .get('/')
      .set('Cookie', sess(res))
      .end(function(res){
        res.headers.should.have.property('set-cookie');
        res.body.should.equal('1');
        done();
      });
    });
  })
})
