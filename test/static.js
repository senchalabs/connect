
var connect = require('../');

var fixtures = __dirname + '/fixtures';

var app = connect();
app.use(connect.static(fixtures));

describe('connect.static()', function(){
  it('should serve static files', function(done){
    app.request()
    .get('/todo.txt')
    .expect('- groceries', done);
  })

  it('should support nesting', function(done){
    app.request()
    .get('/users/tobi.txt')
    .expect('ferret', done);
  })
  
  it('should set Content-Type', function(done){
    app.request()
    .get('/todo.txt')
    .expect('Content-Type', 'text/plain; charset=UTF-8', done);
  })
  
  it('should default max-age=0', function(done){
    app.request()
    .get('/todo.txt')
    .expect('Cache-Control', 'public, max-age=0', done);
  })
  
  it('should support urlencoded pathnames', function(done){
    app.request()
    .get('/foo%20bar')
    .expect('baz', done);
  })

  it('should redirect directories', function(done){
    app.request()
    .get('/users')
    .expect(301, done);
  })

  it('should support index.html', function(done){
    app.request()
    .get('/users/')
    .end(function(res){
      res.body.should.equal('<p>tobi, loki, jane</p>');
      res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
      done();
    })
  })

  it('should support ../', function(done){
    app.request()
    .get('/users/../todo.txt')
    .expect('- groceries', done);
  })

  it('should support HEAD', function(done){
    app.request()
    .head('/todo.txt')
    .expect('', done);
  })

  describe('hidden files', function(){
    it('should be ignored by default', function(done){
      app.request()
      .get('/.hidden')
      .expect(404, done);
    })
    
    it('should be served when hidden: true is given', function(done){
      var app = connect();

      app.use(connect.static(fixtures, { hidden: true }));

      app.request()
      .get('/.hidden')
      .expect('I am hidden', done);
    })
  })

  describe('when traversing passed root', function(){
    it('should respond with 403 Forbidden', function(done){
      app.request()
      .get('/users/../../todo.txt')
      .expect(403, done);
    })
    
    it('should catch urlencoded ../', function(done){
      app.request()
      .get('/users/%2e%2e/%2e%2e/todo.txt')
      .expect(403, done);
    })
  })

  describe('on ENOENT', function(){
    it('should next()', function(done){
      app.request()
      .get('/does-not-exist')
      .expect(404, done);
    })
  })

  describe('Range', function(){
    it('should support byte ranges', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=0-4')
      .expect('12345', done);
    })
    
    it('should be inclusive', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=0-0')
      .expect('1', done);
    })
    
    it('should set Content-Range', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=2-5')
      .expect('Content-Range', 'bytes 2-5/9', done);
    })

    it('should support -n', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=-3')
      .expect('789', done);
    })
    
    it('should support n-', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=3-')
      .expect('456789', done);
    })

    it('should respond with 206 "Partial Content"', function(done){
      app.request()
      .get('/nums')
      .set('Range', 'bytes=0-4')
      .expect(206, done);
    })
  })

  // TODO: node bug
  // describe('on ENAMETOOLONG', function(){
  //   it('should next()', function(done){
  //     var path = Array(100).join('foobar');
  // 
  //     app.request()
  //     .get('/' + path)
  //     .expect(404, done);
  //   })
  // })
})