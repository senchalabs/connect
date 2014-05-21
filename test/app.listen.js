
var connect = require('..');
var request = require('supertest');

describe('app.listen()', function(){
  it('should wrap in an http.Server', function(done){
    var app = connect();

    app.use(function(req, res){
      res.end();
    });

    app.listen(0, function(){
      request(app)
      .get('/')
      .expect(200, done);
    });
  });
});
