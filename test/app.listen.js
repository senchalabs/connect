
var connect = require('../')

describe('app.listen()', function(){
  it('should wrap in an http.Server', function(done){
    var app = connect();

    app.use(function(req, res){
      res.end();
    });

    app.listen(5555, function(){
      app
      .request('/')
      .expect(200, done);
    });
  })
})