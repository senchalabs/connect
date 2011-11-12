
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
    .end(302, done);
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