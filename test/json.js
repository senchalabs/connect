
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
        res.should.have.status(400);
        res.body.should.include('invalid json');
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
  describe('by default', function(){
    it('should check the content-type', function(done){
      var app = connect();
      app.use(connect.json());

      app.use(function(req, res){
        res.end(JSON.stringify(req.body));
      });

      app.request()
      .post('/')
      .write('["foo"]')
      .expect('{}', done);
    })
  })
  describe('when ignoring the content-type', function(){
    it('should not check the content-type', function(done){
      var app = connect();
      app.use(connect.json({ignoreContentType:true}));

      app.use(function(req, res){
        res.end(JSON.stringify(req.body));
      });

      app.request()
      .post('/')
      .write('["foo"]')
      .expect('["foo"]', done);
    })
  })
})