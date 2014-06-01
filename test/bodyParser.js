
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

    it('should support files', function(done){
      var app = connect();

      app.use(connect.bodyParser());

      app.use(function(req, res){
        assert('Tobi' == req.body.user.name);
        req.files.text.originalFilename.should.equal('foo.txt');
        req.files.text.path.should.containEql('.txt');
        res.end(req.files.text.originalFilename);
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name]"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('foo.txt');
        done();
      });
    })

    it('should expose options to multiparty', function(done){
      var app = connect();

      app.use(connect.bodyParser({
        keepExtensions: true
      }));

      app.use(function(req, res){
        assert('Tobi' == req.body.user.name);
        assert(~req.files.text.path.indexOf('.txt'));
        res.end(req.files.text.originalFilename);
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name]"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('foo.txt');
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

    it('should support nesting', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name][first]"\r\n')
      .write('\r\n')
      .write('tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name][last]"\r\n')
      .write('\r\n')
      .write('holowaychuk')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="user[age]"\r\n')
      .write('\r\n')
      .write('1')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="species"\r\n')
      .write('\r\n')
      .write('ferret')
      .write('\r\n--foo--')
      .end(function(res){
        var obj = JSON.parse(res.body);
        obj.user.age.should.equal('1');
        obj.user.name.should.eql({ first: 'tobi', last: 'holowaychuk' });
        obj.species.should.equal('ferret');
        done();
      });
    })

    it('should support multiple files of the same name', function(done){
      var app = connect();

      app.use(connect.bodyParser());

      app.use(function(req, res){
        req.files.text.should.have.length(2);
        assert(req.files.text[0]);
        assert(req.files.text[1]);
        res.end();
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.statusCode.should.equal(200);
        done();
      });
    })

    it('should support nested files', function(done){
      var app = connect();

      app.use(connect.bodyParser());

      app.use(function(req, res){
        Object.keys(req.files.docs).should.have.length(2);
        req.files.docs.foo.originalFilename.should.equal('foo.txt');
        req.files.docs.bar.originalFilename.should.equal('bar.txt');
        res.end();
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="docs[foo]"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="docs[bar]"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.statusCode.should.equal(200);
        done();
      });
    })

    it('should next(err) on multipart failure', function(done){
      var app = connect();

      app.use(connect.bodyParser());

      app.use(function(req, res){
        res.end('whoop');
      });

      app.use(function(err, req, res, next){
        err.message.should.equal('parser error, 16 of 28 bytes parsed');
        res.statusCode = 500;
        res.end();
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.statusCode.should.equal(500);
        done();
      });
    })
  })

  describe('verify', function () {
    it('should throw 403 if verification fails in json', function (done) {
      var app = connect();

      app.use(connect.bodyParser({
        verify: function () {
          throw new Error();
        }
      }))

      app.request()
      .post('/')
      .set('Content-Type', 'application/json')
      .write('{"user":"tobi"}')
      .expect(403, done);
    })

    it('should throw 403 if verification fails in urlencoded', function (done) {
      var app = connect();

      app.use(connect.bodyParser({
        verify: function () {
          throw new Error();
        }
      }))

      app.request()
      .post('/')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .write('user=tobi')
      .expect(403, done);
    })

    it('should not throw if verification does not throw', function (done) {
      var app = connect();

      app.use(connect.bodyParser({
        verify: function () {}
      }))

      app.use(function (req, res, next) {
        res.statusCode = 204;
        res.end();
      })

      app.request()
      .post('/')
      .set('Content-Type', 'application/json')
      .write('{"user":"tobi"}')
      .expect(204, done);
    })
  })
})
