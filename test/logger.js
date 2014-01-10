
var connect = require('../'),
  should = require('should');

var lastLogLine;
function saveLastLogLine(line) { lastLogLine = line; }

var app = connect();

var loggerOptions = { format: 'default', stream: { write: saveLastLogLine } };

app.use(connect.logger(loggerOptions));

var statusCode = 200;
app.use(function (req, res) {
  res.statusCode = statusCode;
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
    });

    it('should be able to skip based on request', function (done) {
      loggerOptions.skip = function (req,res){
        return res.query.skip;
      };
      lastLogLine=null;
      app.request()
      .get('/?skip=true')
      .set('Connection', 'close')
      .end(function (res) {
        should.not.exist(lastLogLine);
        done();
      });
    });

    it('should be able to skip based on response', function (done) {
      loggerOptions.skip = function (req,res){
        return res.statusCode===304;
      };
      lastLogLine = null;
      statusCode = 304;
      app
      .request()
      .get('/')
      .end(function (res) {
        should.not.exist(lastLogLine);
        done();
      });
    });

  })

});
