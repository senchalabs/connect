
var bytes = require('bytes');
var connect = require('..');

var app = connect();

app.use(connect.urlencoded({ limit: '1mb' }));

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

describe('connect.urlencoded()', function(){
  it('should default to {}', function(done){
    app.request()
    .post('/')
    .expect('{}', done)
  })

  it('should accept a limit option', function(done){
    var len = bytes('1mb') + 1;
    var buf = new Buffer(len);

    app.request()
    .post('/')
    .set('Content-Length', len)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write(buf)
    .expect(413, done)
  })

  it('should support all http methods', function(done){
    app.request()
    .get('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Content-Length', 'user=tobi'.length)
    .write('user=tobi')
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
  
  it('should support legacy verify function', function(done){
    var app = connect();

    app.use(connect.urlencoded({verify: function (req, res, str) {
      if (str.indexOf('user') === 0) throw new Error('ack!')
    }}));

    app.use(function(req, res){
      res.end(JSON.stringify(req.body));
    });

    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write('user=tobi')
    .expect(403, done);
  })
})
