
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
})