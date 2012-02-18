
var connect = require('../');

var app = connect();

app.use(connect.limit('5kb'));

app.use(function(req, res){
  res.end('stuff');
});

describe('connect.limit()', function(){
  describe('when Content-Length is below', function(){
    it('should bypass limit()', function(done){
      app.request()
      .post('/')
      .set('Content-Length', 500)
      .expect(200, done);
    })
  })

  describe('when Content-Length is too large', function(){
    it('should respond with 413', function(done){
      app.request()
      .post('/')
      .set('Content-Length', 10 * 1024)
      .expect(413, done);
    })
  })
})