
var connect = require('../');

var app = connect();

app.use(connect.methodOverride());

app.use(function(req, res){
  res.end(req.method);
});

describe('connect.methodOverride()', function(){
  it('should not touch the method by default', function(done){
    app.request()
    .get('/')
    .expect('GET', done);
  })

  it('should be case in-sensitive', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('X-HTTP-Method-Override', 'DELETE')
    .expect('DELETE', done);
  })

  it('should ignore invalid methods', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('X-HTTP-Method-Override', 'POST')
    .expect('POST', done);
  })
})
