
var connect = require('../');
var should = require('should');

var lastLogLine;
function saveLastLogLine(line) { lastLogLine = line; }

describe('connect.logger()', function () {
  describe('when Connection: close', function () {
    it('should log the client ip', function (done) {
      var app = connect();

      app.use(connect.logger({'format': 'default', 'stream': {'write': saveLastLogLine}}));
      app.use(function (req, res) {
        res.end(req.connection.remoteAddress);
      });

      lastLogLine = null;

      app.request()
      .get('/')
      .set('Connection', 'close')
      .end(function (res) {
        lastLogLine.should.startWith(res.body);
        done();
      });
    })

    it('should be able to skip based on request', function (done) {
      var app = connect();

      function skip(req) { return req.query.skip; }

      app.use(connect.logger({'format': 'default', 'skip': skip, 'stream': {'write': saveLastLogLine}}));
      app.use(function (req, res) {
        res.end(req.connection.remoteAddress);
      });

      lastLogLine = null;

      app.request()
      .get('/?skip=true')
      .set('Connection', 'close')
      .end(function (res) {
        should.not.exist(lastLogLine);
        done();
      });
    });

    it('should be able to skip based on response', function (done) {
      var app = connect();

      function skip(req, res) { return res.statusCode === 304; }

      app.use(connect.logger({'format': 'default', 'skip': skip, 'stream': {'write': saveLastLogLine}}));
      app.use(function (req, res) {
        res.statusCode = 304;
        res.end(req.connection.remoteAddress);
      });

      lastLogLine = null;

      app.request()
      .get('/')
      .end(function (res) {
        should.not.exist(lastLogLine);
        done();
      });
    });
  })
});
