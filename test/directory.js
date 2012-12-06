
var connect = require('..');

describe('directory()', function(){
  describe('when Accept: application/json is given', function(done){
    it('should respond with json', function(){
      
    })
  })
  
  describe('when Accept: text/html is given', function(){
    it('should respond with json', function(done){
      var app = connect();
      
      app.use(connect.directory('.'));
      
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
})