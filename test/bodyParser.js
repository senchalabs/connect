
var connect = require('../');

var app = connect();

app.use(connect.bodyParser());

app.use(function(req, res){
  res.end(req.body.user);
});

describe('connect.bodyParser()', function(){
  it('should default to {}', function(done){
    app.request()
    .post('/')
    .end(function(res){
      res.body.should.equal('');
      done();
    })
  })

  it('should parse JSON', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/json')
    .write('{"user":"tobi"}')
    .end(function(res){
      res.body.should.equal('tobi');
      done();
    });
  })
  
  it('should parse x-www-form-urlencoded', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write('user=tobi')
    .end(function(res){
      res.body.should.equal('tobi');
      done();
    });
  })
})