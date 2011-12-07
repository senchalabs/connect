
var connect = require('../');

var fixtures = __dirname + '/fixtures';

var app = connect();
app.use(connect.staticCache());
app.use(connect.static(fixtures));

describe('connect.staticCache()', function(){
  it('should serve static files', function(done){
    app.request()
    .get('/todo.txt')
    .expect('- groceries', done);
  })

  it('should set Age', function(done){
    app.request()
    .get('/todo.txt')
    .end(function(res){
      res.should.have.header('age');
      done();
    });
  })

  it('should set X-Cache', function(done){
    app.request()
    .get('/todo.txt')
    .end(function(res){
      res.should.have.header('x-cache', 'HIT');
      done();
    });
  })

  it('should retain header fields', function(done){
    app.request()
    .get('/todo.txt')
    .end(function(res){
      res.should.have.header('content-type', 'text/plain; charset=UTF-8');
      res.should.have.header('content-length', '11');
      done();
    });
  })
})