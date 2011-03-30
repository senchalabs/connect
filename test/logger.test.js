
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
  , https = require('https')
  , fs = require('fs');

var fixtures = __dirname + '/fixtures'
  , logPath = __dirname + '/fixtures/foo.log';

module.exports = {
  'test http remoteAddress logging': function(){
    var app = connect.createServer(
      connect.logger({
        format: ':remote-addr',
        stream: fs.createWriteStream(logPath)
      })
    );

    assert.response(app,
      { url: '/'},
      function(){
        assert.equal(fs.readFileSync(logPath).toString(), '127.0.0.1\n');
      });
  },
  'test https remoteAddress logging': function(){
    var app = connect.createServer(
      {
        key: fs.readFileSync(__dirname + '/fixtures/ssl.key'),
        cert: fs.readFileSync(__dirname + '/fixtures/ssl.crt')
      },
      connect.logger({
        format: ':remote-addr',
        stream: fs.createWriteStream(logPath)
      })
    );

    app.listen(7777, '127.0.0.1', function() {
      var request = https.request({
        host: '127.0.0.1',
        port: 7777,
        method: 'GET',
        path: '/'
      });

      request.on('response', function(response){
        response.body = '';

        response.setEncoding('utf8');
        response.on('data', function(data) { response.body += data; });
        response.on('end', function(){
          var status = 404;

          assert.equal(response.statusCode, status);
          assert.equal(fs.readFileSync(logPath).toString(), '127.0.0.1\n');

          app.close();
        });
      });

      request.end();
    });
  }
};
