
var connect = require('../')
  , request = require('./support/http')
  , assert = require('assert');

function respond(req, res) {
  res.end();
}

function sid(res) {
  return /^connect\.sid=([^;]+);/.exec(res.headers['set-cookie'][0])[1];
}

function expires(res) {
  return res.headers['set-cookie'][0].match(/expires=([^;]+)/)[1];
}

var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session())
  .use(respond);

describe('connect.session()', function(){
  it('should export constructors', function(){
    connect.session.Session.should.be.a('function');
    connect.session.Store.should.be.a('function');
    connect.session.MemoryStore.should.be.a('function');
  })

  describe('key option', function(){
    it('should default to "connect.sid"', function(done){
      app.request()
      .get('/')
      .end(function(res){
        res.headers['set-cookie'].should.have.length(1);
        res.headers['set-cookie'][0].should.match(/^connect\.sid/);
        done();
      });
    })

    it('should allow overriding', function(done){
      var app = connect()
        .use(connect.cookieParser('keyboard cat'))
        .use(connect.session({ key: 'sid' }))
        .use(respond);
      

      app.request()
      .get('/')
      .end(function(res){
        res.headers['set-cookie'].should.have.length(1);
        res.headers['set-cookie'][0].should.match(/^sid/);
        done();
      });
    })
  })

  it('should retain the sid', function(done){
    app.request()
    .get('/')
    .end(function(res){

      var id = sid(res);
      app.request()
      .get('/')
      .set('Cookie', 'connect.sid=' + id)
      .end(function(res){
        sid(res).should.equal(id);
        done();
      });
    });
  })

  describe('when an invalid sid is given', function(){
    it('should generate a new one', function(done){
      app.request()
      .get('/')
      .set('Cookie', 'connect.sid=foobarbaz')
      .end(function(res){
        sid(res).should.not.equal('foobarbaz');
        done();
      });
    })
  })

  it('should issue separate sids', function(done){
    app.request()
    .get('/')
    .end(function(res){

      var id = sid(res);
      app.request()
      .get('/')
      .set('Cookie', 'connect.sid=' + id)
      .end(function(res){
        sid(res).should.equal(id);

        app.request()
        .get('/')
        .end(function(res){
          sid(res).should.not.equal(id);
          done();
        });
      });
    });
  })

  describe('req.session', function(){
    it('should persist', function(done){
      var app = connect()
        .use(connect.cookieParser('keyboard cat'))
        .use(connect.session())
        .use(function(req, res, next){
          req.session.count = req.session.count || 0;
          req.session.count++;
          res.end(req.session.count.toString());
        });
        
      app.request()
      .get('/')
      .end(function(res){
        res.body.should.equal('1');

        app.request()
        .get('/')
        .set('Cookie', 'connect.sid=' + sid(res))
        .end(function(res){
          var id = sid(res);
          res.body.should.equal('2');
          done();
        });
      });
    })

    describe('.destroy()', function(){
      it('should destroy the previous session', function(done){
        var app = connect()
          .use(connect.cookieParser('keyboard cat'))
          .use(connect.session())
          .use(function(req, res, next){
            req.session.destroy(function(err){
              if (err) throw err;
              assert(!req.session, 'req.session after destroy');
              res.end();
            });
          });

        app.request()
        .get('/')
        .end(function(res){
          res.headers.should.not.have.property('set-cookie');
          done();
        });
      })
    })

    describe('.regenerate()', function(){
      it('should destroy/replace the previous session', function(done){
        var app = connect()
          .use(connect.cookieParser('keyboard cat'))
          .use(connect.session())
          .use(function(req, res, next){
            var id = req.session.id;
            req.session.regenerate(function(err){
              if (err) throw err;
              id.should.not.equal(req.session.id);
              res.end();
            });
          });

        app.request()
        .get('/')
        .end(function(res){
          var id = sid(res);

          app.request()
          .get('/')
          .set('Cookie', 'connect.sid=' + id)
          .end(function(res){
            sid(res).should.not.equal(id);
            done();
          });
        });
      })
    })
  })

})