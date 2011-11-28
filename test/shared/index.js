
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
