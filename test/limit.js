
var connect = require('../');
var bytes = require('bytes');

var app = connect();

app.use(connect.limit('5kb'));

app.use(function(req, res){
  res.end('stuff');
});

describe('connect.limit()', function(){
  it('should require limit', function(){
    connect.limit.bind().should.throw()
  })

  it('should no break data events', function(done){
    var app = connect();

    app.use(connect.limit('1kb'));

    app.use(function(req, res){
      var buf = '';
      req.on('data', function(chunk){
        buf += chunk;
      });
      req.on('end', function(){
        res.end(buf);
      });
    });

    app.request()
    .post('/')
    .set('Content-Type', 'text/plain')
    .write('hi!')
    .expect('hi!', done);
  })

  describe('when Content-Length is below', function(){
    it('should bypass limit()', function(done){
      app.request()
      .post('/')
      .set('Content-Length', 500)
      .expect(200, done);
    })
  })

  describe('when Content-Length is too large', function(){
    it('should respond with 413', function(done){
      var len = bytes('10kb');
      var buf = new Buffer(len);

      app.request()
      .post('/')
      .set('Content-Length', len)
      .write(buf)
      .expect(413, done)
    })
  })

  describe('when multiple limits', function(){
    it('should only honor first', function(done){
      var app = connect();

      app.use(connect.limit('15kb'));
      app.use(connect.limit('5kb'));

      app.use(function(req, res){
        res.end('stuff');
      });

      app.request()
      .post('/')
      .set('Content-Length', 10 * 1024)
      .expect(200, done);
    })
  })
})
