
var connect = require('../')
  , request = require('./support/http');

function respond(req, res) {
  res.end(JSON.stringify(req.session));
}

function sid(res) {
  return /^connect\.sid=([^;]+);/.exec(res.headers['set-cookie'][0])[1];
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
})