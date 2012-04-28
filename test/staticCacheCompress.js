
var connect = require('../');

var fixtures = __dirname + '/fixtures';

var app = connect();
app.use(connect.compress());
app.use(connect.staticCache());
app.use(connect.static(fixtures));

describe('connect.staticCache() & connect.compress()', function(){
  it('should set X-Cache to MISS when missed', function(done){
    app.request()
    .set('Accept-Encoding', 'gzip')
    .get('/todo.txt')
    .expect('X-Cache', 'MISS', done);
  })

  it('should set X-Cache to HIT when hit', function(done){
    app.request()
    .set('Accept-Encoding', 'gzip')
    .get('/todo.txt')
    .expect('X-Cache', 'HIT', done);
  })

  it('should gzip files when asked', function(done){
    app.request()
    .get('/todo.txt')
    .set('Accept-Encoding', 'gzip')
    .end(function(res){
      res.body.should.not.equal('- groceries');
      done();
    });
  })

  it('should not gzip files when not asked', function(done){
    app.request()
    .get('/todo.txt')
    .expect('- groceries', done);
  })

  it('should set Vary', function(done){
    app.request()
    .get('/todo.txt')
    .set('Accept-Encoding', 'gzip')
    .expect('Vary', 'Accept-Encoding', done);
  })

  it('should set Vary at all times', function(done){
    app.request()
    .get('/todo.txt')
    .expect('Vary', 'Accept-Encoding', done);
  })

  it('should set Content-Encoding', function(done){
    app.request()
    .get('/todo.txt')
    .set('Accept-Encoding', 'gzip')
    .expect('Content-Encoding', 'gzip', done);
  })
});