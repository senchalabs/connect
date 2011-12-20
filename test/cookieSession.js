
var connect = require('../')
  , request = require('./support/http');

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
    app.use(connect.cookieParser('some secret'));
    app.use(connect.cookieSession());
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
    app.use(function(req, res){
      req.session.should.eql({});
      req.session = null;
      res.end();
    });

    app.request()
    .get('/')
    .end(function(res){
      app.request()
      .get('/')
      .set('Cookie', sess(res))
      .end(done);
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
        cookie.should.include('path=/');
        cookie.should.include('httpOnly');
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
      .get('/')
      .end(function(res){
        var cookie = sess(res);
        cookie.should.include('path=/admin');
        cookie.should.not.include('httpOnly');
        done();
      })
    })
  })

  describe('cookie option', function(){
    it('should override defaults', function(done){
      var app = connect();
      app.use(connect.cookieParser('some secret'));
      app.use(connect.cookieSession({ cookie: { httpOnly: false }}));

      app.use(function(req, res){
        res.end();
      });

      app.request()
      .get('/')
      .end(function(res){
        var cookie = sess(res);
        cookie.should.include('path=/');
        cookie.should.not.include('httpOnly');
        done();
      })
    })
  })

  describe('.secure', function(){
    it('should not set-cookie when insecure', function(done){
      var app = connect()
        .use(connect.cookieParser('keyboard cat'))
        .use(connect.cookieSession())
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
          .use(connect.cookieParser('keyboard cat'))
          .use(connect.cookieSession({ proxy: true, cookie: { secure: true }}))
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
          .use(connect.cookieParser('keyboard cat'))
          .use(connect.cookieSession({ cookie: { secure: true }}))
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
})