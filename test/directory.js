
var connect = require('..');

var app = connect();
app.use(connect.directory('.'));

describe('directory()', function(){
  describe('when Accept: application/json is given', function(){
    it('should respond with json', function(done){
      app.request()
      .get('/')
      .set('Accept', 'application/json')
      .end(function(res){
        var arr = JSON.parse(res.body);
        arr.should.include('lib');
        arr.should.include('node_modules');
        arr.should.include('docs');
        arr.should.include('Readme.md');
        done();
      });
    })
  })
  
  describe('when Accept: text/html is given', function(){
    it('should respond with html', function(done){
      app.request()
      .get('/')
      .set('Accept', 'text/html')
      .end(function(res){
        res.body.should.include('<a href="/lib"');
        res.body.should.include('<a href="/package.json"');
        done();
      });
    })
  })
  
  describe('when Accept: text/plain is given', function(){
    it('should respond with text', function(done){
      app.request()
      .get('/')
      .set('Accept', 'text/plain')
      .end(function(res){
        res.body.should.include('lib')
        res.body.should.include('docs')
        done();
      });
    })
  })
})