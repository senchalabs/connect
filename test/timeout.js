
var connect = require('../');

var app = connect();

app.use(connect.timeout({
  code: 503,
  time: 500
}));

app.use(function(req, res, next) {
  if (req.url === '/should/timeout') {
    // chill and wait for timeout
  }
  else if (req.url === '/should/not/timeout') {
    res.writeHead(200);
    res.end();
  }
  else if (req.url === '/should/interrupt/timeout') {
    req.clearTimeout();
    setTimeout(function() {
      res.writeHead(200);
      res.end();
    }, 1000);     // Wait until after timeout `time`
  }
});

// Tests

describe('connect.timeout()', function() {
  it('should timeout', function(done) {
    app.request()
    .get('/should/timeout')
    .end(function(res) {
      res.statusCode.should.equal(503);
      done();
    });
  });

  it('should not timeout', function(done) {
    app.request()
    .get('/should/not/timeout')
    .end(function(res) {
      res.statusCode.should.equal(200);
      done();
    });
  });

  it('should interrupt timeout', function(done) {
    app.request()
    .get('/should/interrupt/timeout')
    .end(function(res) {
      res.statusCode.should.equal(200);
      done();
    });
  });
});
