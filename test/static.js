
var connect = require('../');

var fixtures = __dirname + '/fixtures';

var app = connect();
app.use(connect.static(fixtures));

app.use(function(req, res){
  res.statusCode = 404;
  res.end('sorry!');
});

describe('connect.static()', function(){
  it('should serve static files', function(done){
    app.request()
    .get('/todo.txt')
    .expect('- groceries', done);
  })

  it('should support nesting', function(done){
    app.request()
    .get('/users/tobi.txt')
    .expect('ferret', done);
  })

  it('should set Content-Type', function(done){
    app.request()
    .get('/todo.txt')
    .expect('Content-Type', 'text/plain; charset=UTF-8', done);
  })

  it('should default max-age=0', function(done){
    app.request()
    .get('/todo.txt')
    .expect('Cache-Control', 'public, max-age=0', done);
  })

  it('should support urlencoded pathnames', function(done){
    app.request()
    .get('/foo%20bar')
    .expect('baz', done);
  })

  it('should not choke on auth-looking URL', function(done){
    app.request()
    .get('//todo@txt')
    .expect(404, done);
  })

  it('should redirect directories with query string', function (done) {
    app.request()
    .get('/users?name=john')
    .expect('Location', '/users/?name=john', done);
  })

  it('should redirect directories', function(done){
    app.request()
    .get('/users')
    .expect(303, done);
  })

  it('should support index.html', function(done){
    app.request()
    .get('/users/')
    .end(function(res){
      res.body.should.equal('<p>tobi, loki, jane</p>');
      res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
      done();
    })
  })

  it('should support ../', function(done){
    app.request()
    .get('/users/../todo.txt')
    .expect('- groceries', done);
  })

  it('should support HEAD', function(done){
    app.request()
    .head('/todo.txt')
    .expect('', done);
  })

  it('should support conditional requests', function(done){
    app.request()
    .get('/todo.txt')
    .end(function(res){
      app.request()
      .get('/todo.txt')
      .set('If-None-Match', res.headers.etag)
      .expect(304, done);
    });
  })

  describe('hidden files', function(){
    it('should be ignored by default', function(done){
      app.request()
      .get('/.hidden')
      .expect(404, done);
    })

    it('should be served when hidden: true is given', function(done){
      var app = connect();

      app.use(connect.static(fixtures, { hidden: true }));

      app.request()
      .get('/.hidden')
      .expect('I am hidden', done);
    })
  })

  describe('maxAge', function(){
    it('should be 0 by default', function(done){
      app.request()
      .get('/todo.txt')
      .end(function(res){
        res.should.have.header('cache-control', 'public, max-age=0');
        done();
      });
    })

    it('should be reasonable when infinite', function(done){
      var app = connect();

      app.use(connect.static(fixtures, { maxAge: Infinity }));

      app.request()
      .get('/todo.txt')
      .end(function(res){
        res.should.have.header('cache-control', 'public, max-age=' + 60*60*24*365);
        done();
      });
    })
  })

  describe('when traversing passed root', function(){
    it('should respond with 403 Forbidden', function(done){
      app.request()
      .get('/users/../../todo.txt')
      .expect(403, done);
    })

    it('should catch urlencoded ../', function(done){
      app.request()
      .get('/users/%2e%2e/%2e%2e/todo.txt')
      .expect(403, done);
    })
  })

  describe('on ENOENT', function(){
    it('should next()', function(done){
      app.request()
      .get('/does-not-exist')
      .end(function(res){
        res.should.have.status(404);
        res.body.should.equal('sorry!');
        done();
      });
    })
  })

  describe('Range', function(){
    it('should support byte ranges', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=0-4')
      .expect('12345', done);
    })

    it('should be inclusive', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=0-0')
      .expect('1', done);
    })

    it('should set Content-Range', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=2-5')
      .expect('Content-Range', 'bytes 2-5/9', done);
    })

    it('should support -n', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=-3')
      .expect('789', done);
    })

    it('should support n-', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=3-')
      .expect('456789', done);
    })

    it('should respond with 206 "Partial Content"', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=0-4')
      .expect(206, done);
    })

    it('should set Content-Length to the # of octets transferred', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=2-3')
      .end(function(res){
        res.body.should.equal('34');
        res.headers['content-length'].should.equal('2');
        done();
      });
    })

    describe('when last-byte-pos of the range is greater than current length', function(){
      it('is taken to be equal to one less than the current length', function(done){
        app.request()
        .get('/nums')
        .set('Range', 'bytes=2-50')
        .expect('Content-Range', 'bytes 2-8/9', done)
      })

      it('should adapt the Content-Length accordingly', function(done){
        app.request()
        .get('/nums')
        .set('Range', 'bytes=2-50')
        .end(function(res){
          res.headers['content-length'].should.equal('7');
          done();
        });
      })
    })

    describe('when the first- byte-pos of the range is greater than the current length', function(){
      it('should respond with 416', function(done){
        app.request()
        .get('/nums')
        .set('Range', 'bytes=9-50')
        .expect(416, done);
      })

      it('should include a Content-Range field with a byte-range- resp-spec of "*" and an instance-length specifying the current length', function(done){
        app.request()
        .get('/nums')
        .set('Range', 'bytes=9-50')
        .expect('Content-Range', 'bytes */9', done)
      })
    })

    describe('when syntactically invalid', function(){
      it('should respond with 200 and the entire contents', function(done){
        app.request()
        .get('/nums')
        .set('Range', 'asdf')
        .expect('123456789', done);
      })
    })
  })

  describe('when a trailing backslash is given', function(){
    if (connect.utils.brokenPause) {
      // https://github.com/senchalabs/connect/issues/452
      it('should 500 in node < 0.10 because fs.stat is broken', function(done){
        app.request()
        .get('/todo.txt\\')
        .expect(500, done);
      })
    } else {
      it('should 404 as expected in node >= 0.10', function(done){
        app.request()
        .get('/todo.txt\\')
        .expect(404, done);
      })
    }
  })

  describe('with a malformed URL', function(){
    it('should respond with 400', function(done){
      app.request()
      .get('/%')
      .expect(400, done)
    });
  })

  describe('on ENAMETOOLONG', function(){
    it('should next()', function(done){
      var path = Array(100).join('foobar');

      app.request()
      .get('/' + path)
      .expect(404, done);
    })
  })

  describe('on ENOTDIR', function(){
    it('should next()', function(done) {
      app.request()
      .get('/todo.txt/a.php')
      .expect(404, done);
    })
  })

  describe('when mounted', function(){
    it('should redirect when index at mount point', function (done) {
      var app = connect();

      app.use('/users', connect.static('test/fixtures/users'));

      app.request()
      .get('/users')
      .end(function (res) {
        res.should.have.status(303);
        res.headers.location.should.equal('/users/');
        done();
      });
    });

    it('should redirect relative to the originalUrl', function(done){
      var app = connect();

      app.use('/static', connect.static('test/fixtures'));

      app.request()
      .get('/static/users')
      .end(function(res){
        res.headers.location.should.equal('/static/users/');
        res.should.have.status(303);
        done();
      });
    })
  })

  describe('when responding non-2xx or 304', function(){
    it('should respond as-is', function(done){
      var app = connect();
      var n = 0;

      app.use(function(req, res, next){
        switch (n++) {
          case 0: return next();
          case 1: res.statusCode = 500; return next();
        }
      });

      app.use(connect.static(fixtures));

      app.request()
      .get('/todo.txt')
      .end(function(res){
        app.request()
        .get('/todo.txt')
        .set('If-None-Match', res.headers.etag)
        .end(function(res){
          res.should.have.status(500);
          res.body.should.equal('- groceries');
          done();
        })
      })
    })
  })
})
