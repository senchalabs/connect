
var connect = require('../');

var app = connect();

app.use(connect.bodyParser());
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

  it('should support req.body._method', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write('_method=DELETE')
    .expect('DELETE', done);
  })

  it('should be case in-sensitive', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write('_method=delete')
    .expect('DELETE', done);
  })

  it('should ignore invalid methods', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write('_method=<whatever>')
    .expect('POST', done);
  })
})
