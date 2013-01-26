
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
        res.body.should.include('{"name":"lib"');
        res.body.should.include('{"name":"node_modules"');
        res.body.should.include('{"name":"docs"');
        res.body.should.include('{"name":"Readme.md"');
        done();
      });
    })
  })
  
  describe('when Accept: text/html is given', function(){
    it('should respond with json', function(done){
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
        res.body.should.include('{"name":"lib"');
        res.body.should.include('{"name":"docs"');
        done();
      });
    })
  })
})