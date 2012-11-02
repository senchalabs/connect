
var connect = require('../');

function test(app, signature) {
  describe(signature, function(){
    describe('when missing Authorization', function(){
      it('should respond with 401 and WWW-Authenticate', function(done){
        app.request()
        .get('/')
        .end(function(res){
          res.statusCode.should.equal(401);
          res.headers['www-authenticate'].should.equal('Basic realm="Authorization Required"');
          done();
        });
      })
    })

    describe('when valid', function(){
      it('should next()', function(done){
        app.request()
        .get('/')
        .set('Authorization', 'Basic dGo6dG9iaTpsZWFybmJvb3N0')
        .end(function(res){
          res.statusCode.should.equal(200);
          res.body.should.equal('secret!');
          done();
        });
      })
    })

    describe('when invalid credentials', function(){
      it('should respond with 401', function(done){
        app.request()
        .get('/')
        .set('Authorization', 'Basic dGo69iaQ==')
        .end(function(res){
          res.statusCode.should.equal(401);
          res.headers['www-authenticate'].should.equal('Basic realm="Authorization Required"');
          res.body.should.equal('Unauthorized');
          done();
        });
      })
    })

    describe('when authorization header is not Basic', function(){
      it('should respond with 400', function(done){
        app.request()
        .get('/')
        .set('Authorization', 'Digest dGo69iaQ==')
        .end(function(res){
          res.statusCode.should.equal(400);
          res.body.should.match(/Bad Request/);
          done();
        });
      })
    })

    describe('when authorization header is malformed - contains only one part', function(){
      it('should respond with 400', function(done){
        app.request()
        .get('/')
        .set('Authorization', 'invalid')
        .end(function(res){
          res.statusCode.should.equal(400);
          res.body.should.match(/Bad Request/);
          done();
        });
      })
    })
  })
}

var app = connect();

app.use(connect.basicAuth('tj', 'tobi:learnboost'));

app.use(function(req, res, next){
  req.user.should.equal('tj');
  res.end('secret!');
});

test(app, 'connect.basicAuth(user, pass)');



var app = connect();

app.use(connect.basicAuth(function(user, pass){
  return 'tj' == user && 'tobi:learnboost' == pass;
}));

app.use(function(req, res, next){
  req.user.should.equal('tj');
  res.end('secret!');
});

test(app, 'connect.basicAuth(callback)');



var app = connect();

app.use(connect.basicAuth(function(user, pass, fn){
  var ok = 'tj' == user && 'tobi:learnboost' == pass;
  fn(null, ok
    ? { name: 'tj' }
    : null);
}));

app.use(function(req, res, next){
  req.user.name.should.equal('tj');
  res.end('secret!');
});

test(app, 'connect.basicAuth(callback) async');
