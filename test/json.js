
var bytes = require('bytes');
var connect = require('..');

var app = connect();

app.use(connect.json({ limit: '1mb' }));

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

describe('connect.json()', function(){
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
    .set('Content-Type', 'application/json')
    .write(buf)
    .expect(413, done)
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

  it('should fail gracefully', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/json')
    .write('{"user"')
    .end(function(res){
      res.statusCode.should.equal(400);
      res.body.should.containEql('Unexpected end of input');
      done();
    });
  })

  it('should handle Content-Length: 0', function(done){
    var app = connect();
    app.use(connect.json());

    app.use(function(req, res){
      res.end(Object.keys(req.body).length ? '' : 'empty');
    });

    app.request()
    .get('/')
    .set('Content-Type', 'application/json')
    .set('Content-Length', '0')
    .end(function(res){
      res.statusCode.should.equal(200);
      res.body.should.equal('empty');
      done();
    });
  })

  it('should handle no body', function(done){
    var app = connect();
    app.use(connect.json());

    app.use(function(req, res){
      res.end(Object.keys(req.body).length ? '' : 'empty');
    });

    app.request()
    .post('/')
    .set('Content-Type', 'application/json')
    .end(function(res) {
      res.statusCode.should.equal(200);
      res.body.should.equal('empty');
      done();
    })
  })

  it('should 400 on malformed JSON', function(done){
    var app = connect();
    app.use(connect.json());

    app.use(function(req, res){
      res.end(JSON.stringify(req.body));
    });

    app.request()
    .post('/')
    .set('Content-Type', 'application/json')
    .write('{"foo')
    .expect(400, done);
  })

  it('should support all http methods', function(done){
    var app = connect();
    app.use(connect.json());

    app.use(function(req, res){
      res.end(JSON.stringify(req.body));
    });

    app.request()
    .get('/')
    .set('Content-Type', 'application/json')
    .set('Content-Length', '["foo"]'.length)
    .write('["foo"]')
    .expect('["foo"]', done);
  })

  describe('when strict is false', function(){
    it('should parse primitives', function(done){
      var app = connect();
      app.use(connect.json({ strict: false }));

      app.use(function(req, res){
        res.end(JSON.stringify(req.body));
      });

      app.request()
      .post('/')
      .set('Content-Type', 'application/json')
      .write('true')
      .expect('true', done);
    })
  })

  describe('when strict is true', function(){
    it('should not parse primitives', function(done){
      var app = connect();
      app.use(connect.json({ strict: true }));

      app.use(function(req, res){
        res.end(JSON.stringify(req.body));
      });

      app.request()
      .post('/')
      .set('Content-Type', 'application/json')
      .write('true')
      .end(function(res){
        res.statusCode.should.equal(400);
        res.body.should.containEql('invalid json');
        done();
      });
    })

    it('should allow leading whitespaces in JSON', function(done){
      var app = connect();
      app.use(connect.json({ strict: true }));

      app.use(function(req, res){
        res.end(JSON.stringify(req.body));
      });

      app.request()
      .post('/')
      .set('Content-Type', 'application/json')
      .write('   { "user": "tobi" }')
      .end(function(res){
        res.statusCode.should.equal(200);
        res.body.should.containEql('{"user":"tobi"}');
        done();
      });
    })
  })

  describe('by default', function(){
    it('should 400 on primitives', function(done){
      var app = connect();
      app.use(connect.json());

      app.use(function(req, res){
        res.end(JSON.stringify(req.body));
      });

      app.request()
      .post('/')
      .set('Content-Type', 'application/json')
      .write('true')
      .expect(400, done);
    })
  })

  it('should support utf-8', function(done){
    var app = connect();

    app.use(connect.json());

    app.use(function(req, res, next){
      res.end(req.body.name);
    });

    app.request()
    .post('/')
    .set('Content-Type', 'application/json; charset=utf-8')
    .write('{"name":"论"}')
    .expect('论', done);
  })

  it('should support {"test":"å"}', function (done) {
    // https://github.com/visionmedia/express/issues/1816

    var app = connect();
    app.use(connect.json());
    app.use(function(req, res, next){
      res.end(req.body.test);
    })

    app.request()
    .post('/')
    .set('Content-Type', 'application/json; charset=utf-8')
    .set('Content-Length', '13')
    .write('{"test":"å"}')
    .expect('å', done);
  })

  describe('the default json mime type acceptance', function() {
    it('should support the basic JSON mime type', function (done) {
      app.request()
      .post('/')
      .set('Content-Type', 'application/json')
      .write('{"user":"tobi"}')
      .expect('{"user":"tobi"}', done);
    })

    it('should not match incorrect mime type', function (done) {
      app.request()
      .post('/')
      .set('Content-Type', 'zapplication/json')
      .write('{"user":"tobi"}')
      .expect('{}', done);
    })

    it('should support suffix notation', function (done) {
      app.request()
      .post('/')
      .set('Content-Type', 'application/vnd.organization.prog-type.org+json')
      .write('{"user":"tobi"}')
      .expect('{"user":"tobi"}', done);
    })

    it('should support specific special characters on mime subtype', function (done) {
      app.request()
      .post('/')
      .set('Content-Type', 'application/vnd.organization.special_!#$-^.org+json')
      .write('{"user":"tobi"}')
      .expect('{"user":"tobi"}', done);
    })

    it('should not support other special characters on mime subtype', function (done) {
      app.request()
      .post('/')
      .set('Content-Type', 'application/vnd.organization.special_()<>@,;:\\"/[]?={} \t.org+json')
      .write('{"user":"tobi"}')
      .expect('{}', done);
    })

    it('should not match malformed mime subtype suffix', function (done) {
      app.request()
      .post('/')
      .set('Content-Type', 'application/vnd.test.org+json+xml')
      .write('{"user":"tobi"}')
      .expect('{}', done);
    })
  });

  if (!connect.utils.brokenPause) {
    it('should parse JSON with limit and after next tick', function(done){
      var app = connect();

      app.use(function(req, res, next) {
        setTimeout(next, 10);
      });

      app.use(connect.json({ limit: '1mb' }));

      app.use(function(req, res){
        res.end(JSON.stringify(req.body));
      });

      app.use(function(err, req, res, next){
        res.statusCode = err.status;
        res.end(err.message);
      });

      app.request()
      .post('/')
      .set('Content-Type', 'application/json')
      .write('{"user":"tobi"}')
      .end(function(res){
        res.body.should.equal('{"user":"tobi"}');
        done();
      });
    })
  }
})
