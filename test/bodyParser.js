
var connect = require('../');

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
  
  describe('with multipart/form-data', function(){
    it('should populate req.body', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{"user":"Tobi"}');
        done();
      });
    })
    
    it('should work with multiple fields', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="age"\r\n')
      .write('\r\n')
      .write('1')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{"user":"Tobi","age":"1"}');
        done();
      });
    })
  })
})