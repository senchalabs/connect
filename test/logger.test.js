
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , should = require('should')
  , https = require('https')
  , create = require('./common').create
  , fs = require('fs');

module.exports = {
  'test http :req[header]': function(){
    var logLine = '';
    var app = create(
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
    var app = create(
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
  
  'test http :res[header] default': function(){
    var logLine = ''
    var app = create(
      connect.logger({
        format: ':method :url :res[content-length]',
        stream: { write: function(line){ logLine = line; } }
      })
    );

    assert.response(app,
      { url: '/' },
      function(){
        assert.equal(logLine, 'GET / -\n');
      });
  },
  
  'test http :http-version': function(){
    var logLine = '';
    var app = create(
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
    var logLine = '';
    var app = create(
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
    var logLine = '';
    var app = create(
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
    var logLine = '';
    var app = create(
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
    var logLine = '';
    var app = create(
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
    var logLine = '';
    var app = create(
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
    var logLine = '';
    var app = create(
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
    var logLine = '';
    var app = create(
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
    var logLine = '';
    var app = create(
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
  }
};
