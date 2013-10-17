
var connect = require('..');
var assert = require('assert');

var app = connect();

app.use(connect.bodyParser());

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

describe('connect.bodyParser()', function(){
  it('should default to {}', function(done){
    app.request()
    .post('/')
    .end(function(res){
      res.body.should.equal('{}');
      done();
    })
  })

  it('should parse JSON', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/json')
    .write('{"user":"tobi"}')
    .end(function(res){
      res.body.should.equal('{"user":"tobi"}');
      done();
    });
  })

  it('should parse x-www-form-urlencoded', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write('user=tobi')
    .end(function(res){
      res.body.should.equal('{"user":"tobi"}');
      done();
    });
  })

  it('should not parse multipart/form-data', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'multipart/form-data; boundary=foo')
    .write(new Buffer(1024))
    .end(function(res){
      res.body.should.equal(JSON.stringify({}));
      done();
    })
  })
})
