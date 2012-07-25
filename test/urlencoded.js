
var connect = require('../')
  , should = require('./shared');

var app = connect();

app.use(connect.urlencoded({ limit: '1mb' }));

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

describe('connect.urlencoded()', function(){
  should['default request body'](app);
  should['limit body to']('1mb', 'application/x-www-form-urlencoded', app);

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
})