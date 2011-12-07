
var connect = require('../');

var app = connect();

app.use(connect.responseTime());

app.use(function(req, res){
  setTimeout(function(){
    res.setHeader('foo', 'bar');
    res.end();
  }, 30);
});

describe('connect.responseTime()', function(){
  it('should set X-Response-Time', function(done){
    app.request()
    .get('/')
    .end(function(res){
      var n = parseInt(res.headers['x-response-time']);
      n.should.be.above(20);
      done();
    });
  })
})