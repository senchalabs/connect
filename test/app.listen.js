
process.env.NODE_ENV = 'test';

var connect = require('../');
var request = require('./support/http');

describe('app.listen()', function(){
  it('should wrap in an http.Server', function(done){
    var app = connect();

    app.use(function(req, res){
      res.end();
    });

    app.listen(5555, function(){
      request(app)
      .get('/')
      .expect(200, done);
    });
  })
})
