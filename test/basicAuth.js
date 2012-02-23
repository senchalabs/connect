
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
        .set('Authorization', 'Basic dGo6dG9iaQ==')
        .end(function(res){
          res.statusCode.should.equal(200);
          res.body.should.equal('secret!');
          done();
        });
      })
    })

    describe('when invalid', function(){
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
  })
}

var app = connect();

app.use(connect.basicAuth('tj', 'tobi'));

app.use(function(req, res, next){
  req.remoteUser.should.equal('tj');
  res.end('secret!');
});

test(app, 'connect.basicAuth(user, pass)');



var app = connect();

app.use(connect.basicAuth(function(user, pass){
  return 'tj' == user && 'tobi' == pass;
}));

app.use(function(req, res, next){
  req.remoteUser.should.equal('tj');
  res.end('secret!');
});

test(app, 'connect.basicAuth(callback)');



var app = connect();

app.use(connect.basicAuth(function(user, pass, fn){
  var ok = 'tj' == user && 'tobi' == pass;
  fn(null, ok
    ? { name: 'tj' }
    : null);
}));

app.use(function(req, res, next){
  req.remoteUser.name.should.equal('tj');
  res.end('secret!');
});

test(app, 'connect.basicAuth(callback) async');