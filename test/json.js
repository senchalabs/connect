
var connect = require('../')
  , should = require('./shared');

var app = connect();

app.use(connect.json({ limit: '1mb' }));

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

app.use(function(err, req, res, next){
  res.statusCode = err.status;
  res.end(err.message);
});

describe('connect.json()', function(){
  should['default request body'](app);
  should['limit body to']('1mb', 'application/json', app);

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
      res.body.should.equal('Unexpected end of input');
      done();
    });
  })

  it('should handle Content-Length: 0', function(done){
    var app = connect();
    app.use(connect.json());

    app.use(function(req, res){
      res.end('req.body is ' + (Object.keys(req.body).length === 0 ? '' : 'not ') + 'empty');
    });

    app.request()
    .get('/')
    .set('Content-Type', 'application/json')
    .set('Content-Length', '0')
    .end(function(res){
      res.should.have.status(200);
      res.body.should.equal('req.body is empty');
      done();
    });
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

  it('should 400 when no body is given', function(done){
    var app = connect();
    app.use(connect.json());

    app.use(function(req, res){
      res.end(JSON.stringify(req.body));
    });

    app.request()
    .post('/')
    .set('Content-Type', 'application/json')
    .end(function(res) {
      res.should.have.status(400);
      res.body.should.include("invalid json, empty body");
      done();
    })
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
        res.should.have.status(400);
        res.body.should.include('invalid json');
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
        res.should.have.status(200);
        res.body.should.include('{"user":"tobi"}');
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

  describe('the default json mime type regular expression', function() {
    var mimeRegExp = connect.json.regexp;
    it('should support the basic JSON mime type', function(){
      mimeRegExp.test('application/json').should.eql(true);
    })

    it('should not match incorrect mime type', function(){
      mimeRegExp.test('zapplication/json').should.eql(false);
    })

    it('should be case insensitive', function(){
      mimeRegExp.test('Application/JSON').should.eql(true);
    })

    it('should support suffix notation', function(){
      mimeRegExp.test('application/vnd.organization.prog-type.org+json').should.eql(true);
    })

    it('should support specific special characters on mime subtype', function(){
      mimeRegExp.test('application/vnd.organization.special_!#$%*`-^~.org+json').should.eql(true);
    })

    it('should not support other special characters on mime subtype', function(){
      mimeRegExp.test('application/vnd.organization.special_()<>@,;:\\"/[]?={} \t.org+json').should.eql(false);
    })

    it('should not match malformed mime subtype suffix', function(){
      mimeRegExp.test('application/vnd.test.org+json+xml').should.eql(false);
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
