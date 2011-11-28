
var connect = require('../');

describe('exports', function(){
  describe('.middleware', function(){
    it('should lazy-load middleware', function(){
      connect.middleware.cookieParser.should.be.a('function');
      connect.middleware.bodyParser.should.be.a('function');
      connect.middleware.static.should.be.a('function');
    })
  })

  describe('.NAME', function(){
    it('should lazy-load middleware', function(){
      connect.cookieParser.should.be.a('function');
      connect.bodyParser.should.be.a('function');
      connect.static.should.be.a('function');
    })
  })
})