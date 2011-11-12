
var connect = require('../')
  , request = require('./support/http');

var app = connect();

app.use(connect.responseTime());

app.use(function(req, res){
  setTimeout(function(){
    res.end();
  }, 200);
});

describe('connect.responseTime()', function(){
  it('should set X-Response-Time', function(done){
    request(app)
    .get('/')
    .end(function(res){
      var n = parseInt(res.headers['x-response-time']);
      n.should.be.above(200);
      done();
    });
  })
})