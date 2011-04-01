
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
  , https = require('https')
  , fs = require('fs');

module.exports = {
  'test http :req[header]': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':req[foo]',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/', headers: { Foo: 'Bar' } },
      function(){
        assert.equal(logLine, 'Bar\n');
      });
  },
  'test http :res[header]': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':res[content-type]',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/', headers: { Foo: 'Bar' } },
      function(){
        assert.equal(logLine, 'text/plain\n');
      });
  },
  'test http :http-version': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':http-version',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/' },
      function(){
        assert.equal(logLine, '1.1\n');
      });
  },
  'test http :response-time': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':response-time',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/' },
      function(){
        assert.type(parseInt(logLine, 10), 'number');
      });
  },
  'test http :remote-addr': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':remote-addr',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/'},
      function(){
        assert.equal(logLine, '127.0.0.1\n');
      });
  },
  'test http :date': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':date',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/'},
      function(){
        assert.doesNotThrow(function(){
          new Date(logLine);
        });
        assert.type(Date.parse(logLine.replace('\n', '')), 'number');
      });
  },
  'test http :method': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':method',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { method: 'post', url: '/' },
      function(){
        assert.equal(logLine, 'POST\n');
      });
  },
  'test http :url': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':url',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/foo/bar?baz=equals&the#ossom' },
      function(){
        assert.equal(logLine, '/foo/bar?baz=equals&the#ossom\n');
      });
  },
  'test http :referrer': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':referrer',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/', headers: { referrer: 'http://google.com' } },
      function(){
        assert.equal(logLine, 'http://google.com\n');
      });
  },
  'test http :user-agent': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':user-agent',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/', headers: { 'user-agent': 'FooBarClient 1.1.0' } },
      function(){
        assert.equal(logLine, 'FooBarClient 1.1.0\n');
      });
  },
  'test http :status': function(){
    var logLine = ''
      , app = connect.createServer(
          connect.logger({
            format: ':status',
            stream: { write: function(line){ logLine = line; } }
          })
        );

    assert.response(app,
      { url: '/' },
      function(){
        assert.equal(logLine, '404\n');
      });
  },
  // https regression tests
  'test https :remote-addr': function(){
    var logLine = ''
      , app = connect.createServer(
          {
            key: fs.readFileSync(__dirname + '/fixtures/ssl.key'),
            cert: fs.readFileSync(__dirname + '/fixtures/ssl.crt')
          },
          connect.logger({
            format: ':remote-addr',
            stream: { write: function(line){ logLine = line; } }
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
          assert.equal(logLine, '127.0.0.1\n');

          app.close();
        });
      });

      request.end();
    });
  }
};
