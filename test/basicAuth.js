
var connect = require('../')
  , request = require('./support/http');

describe('connect.basicAuth(user, pass)', function(){
  describe('when missing Authorization', function(){
    it('should respond with WWW-Authenticate', function(done){
      var app = connect();

      app.use(connect.basicAuth('tj', 'tobi'));

      app.use(function(req, res, next){
        res.end('secret!');
      });

      request(app)
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
      var app = connect();

      app.use(connect.basicAuth('tj', 'tobi'));

      app.use(function(req, res, next){
        res.end('secret!');
      });

      request(app)
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
    it('should next()', function(done){
      var app = connect();

      app.use(connect.basicAuth('tj', 'tobi'));

      app.use(function(req, res, next){
        res.end('secret!');
      });

      request(app)
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