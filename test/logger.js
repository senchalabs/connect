
var connect = require('../');

var lastLogLine;
function saveLastLogLine(line) { lastLogLine = line; }

var app = connect();

app.use(connect.logger({'format': 'default', 'stream': {'write': saveLastLogLine}}));

app.use(function (req, res) {
  res.end(req.connection.remoteAddress);
});

describe('connect.logger()', function () {
  describe('when Connection: close', function () {
    it('should log the client ip', function (done) {
      app.request()
      .get('/')
      .set('Connection', 'close')
      .end(function (res) {
        lastLogLine.should.startWith(res.body);
        done();
      });
    })
  })

  describe('with custom token', function () {
    it('should output the custom token', function (done) {
      var app = connect();
      connect.logger.token('custom', function (req) { return req.headers['x-custom-value']; });
      app.use(connect.logger({'format': ':custom', 'stream': {'write': saveLastLogLine}}));

      app.request()
      .get('/')
      .set('x-custom-value', 'so_custom')
      .end(function (res) {
        lastLogLine.should.equal('so_custom\n');
        done();
      });
    })
  })
});
