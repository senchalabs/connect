
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

  it('should Set-Cookie', function(done){
    app.request()
    .get('/')
    .end(function(res){
      res.headers['set-cookie'].should.have.length(1);
      res.headers['set-cookie'][0].should.include('connect.sid');
      done();
    });
  })
})