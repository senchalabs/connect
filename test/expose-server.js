
var http = require('http');
var request = require('request');
var connect = require('..');
var should = require('should');

describe('app.use()', function(){
  var app;
  var server;

  beforeEach(function(){
    app = connect();
    server = http.createServer(app);
  });

  it('should expose `this` as the server', function (done) {
    app.use(function (req, res) {
      if (server !== this) {
        throw new Error('server instance not exposed');
      }

      res.end();
    });

    server.listen(function () {
      request.get('http://localhost:' + server.address().port + '/', function () {
        done();
        server.close();
      });
    });
  });
});
