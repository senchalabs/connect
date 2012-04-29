
var connect = require('../');

var fixtures = __dirname + '/fixtures';

var app = connect();
app.use(connect.staticCache());
app.use(connect.static(fixtures, { maxAge: Infinity }));

describe('connect.staticCache()', function(){
  it('should set X-Cache to MISS when missed', function(done){
    app.request()
    .get('/todo.txt')
    .expect('X-Cache', 'MISS', done);
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
    .expect('X-Cache', 'MISS', done);
  })

  it('should set X-Cache to HIT when hit', function(done){
    app.request()
    .get('/todo.txt')
    .expect('X-Cache', 'HIT', done);
  })

  it('should set X-Cache to MISS when query changes', function(done){
    app.request()
    .get('/todo.txt?_=1234')
    .expect('X-Cache', 'MISS', done);
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

  it('should serve the contents on GET', function(done){
    app.request()
    .get('/todo.txt')
    .expect('- groceries', done);
  })

  it('should not serve the contents on HEAD', function(done){
    app.request()
    .head('/todo.txt')
    .expect('', done);
  })

  it('should retain Content-Length on HEAD', function(done){
    app.request()
    .head('/todo.txt')
    .expect('Content-Length', '11', done);
  })

  it('should not cache private', function(done){
    var app = connect();
    app.use(connect.staticCache());
    app.use(function(req, res, next){
      res.setHeader('Cache-Control', 'private');
      next();
    });
    app.use(connect.static(fixtures), { maxAge: Infinity });

    app.request()
    .head('/todo.txt')
    .expect('X-Cache', 'MISS', done);
  })

  it('should not cache no-store', function(done){
    var app = connect();
    app.use(connect.staticCache());
    app.use(function(req, res, next){
      res.setHeader('Cache-Control', 'no-store');
      next();
    });
    app.use(connect.static(fixtures), { maxAge: Infinity });

    app.request()
    .head('/todo.txt')
    .expect('X-Cache', 'MISS', done);
  })
})