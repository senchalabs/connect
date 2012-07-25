
var bytes = require('bytes');

exports['default request body'] = function(app){
  it('should default to {}', function(done){
    app.request()
    .post('/')
    .end(function(res){
      res.body.should.equal('{}');
      done();
    })
  })
};

exports['limit body to'] = function(size, type, app){
  it('should accept a limit option', function(done){
    app.request()
    .post('/')
    .set('Content-Length', bytes(size) + 1)
    .set('Content-Type', type)
    .end(function(res){
      res.should.have.status(413);
      done();
    })
  })
}