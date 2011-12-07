
var connect = require('../');

var fixtures = __dirname + '/fixtures';

var app = connect();
app.use(connect.staticCache());
app.use(connect.static(fixtures));

describe('connect.staticCache()', function(){
  it('should set X-Cache to MISS when missed', function(done){
    app.request()
    .get('/todo.txt')
    .end(function(res){
      res.should.have.header('x-cache', 'MISS');
      done();
    });
  })

  it('should set Age', function(done){
    app.request()
    .get('/todo.txt')
    .end(function(res){
      res.should.have.header('age');
      done();
    });
  })

  it('should set X-Cache to MISS end-to-end', function(done){
    app.request()
    .get('/todo.txt')
    .set('Cache-Control', 'no-cache')
    .end(function(res){
      res.should.have.header('x-cache', 'MISS');
      done();
    });
  })

  it('should set X-Cache to HIT when hit', function(done){
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