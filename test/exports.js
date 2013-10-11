
var connect = require('../');

describe('exports', function(){
  describe('.version', function(){
    it('should be a string', function(){
      connect.version.should.be.a.String;
    })
  })

  describe('.middleware', function(){
    it('should lazy-load middleware', function(){
      connect.middleware.cookieParser.should.be.a.Function;
      connect.middleware.bodyParser.should.be.a.Function;
      connect.middleware.static.should.be.a.Function;
    })
  })

  describe('.NAME', function(){
    it('should lazy-load middleware', function(){
      connect.cookieParser.should.be.a.Function;
      connect.bodyParser.should.be.a.Function;
      connect.static.should.be.a.Function;
    })
  })
})