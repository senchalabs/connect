
var connect = require('../');

var app = connect();

app.use(connect.responseTime());

app.use(function(req, res){
  setTimeout(function(){
    res.end();
  }, 30);
});

describe('connect.responseTime()', function(){
  it('should set X-Response-Time', function(done){
    var start = Date.now();
    app.request()
    .get('/')
    .end(function(res){
      var d = Date.now() - start;
      var n = parseInt(res.headers['x-response-time']);
      n.should.be.within(10, d);
      done();
    });
  })
})
