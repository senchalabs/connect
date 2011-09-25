
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
  , http = require('http')
  , create = require('./common').create;

/**
 * Path to ./test/fixtures/
 */

var fixturesPath = __dirname + '/fixtures';

var app = create(
  connect.staticCache(),
  connect.static(fixturesPath, { maxAge: 60000 })
);

var app2 = create(
  connect.staticCache(),
  connect.static(fixturesPath, { maxAge: 0 })
);


module.exports = {

  'unconditional request': function() {
    assert.response(
      app,
      { url: '/user.json' },
      function(res) {
        res.statusCode.should.equal(200);
        res.headers.should.have.property('last-modified');
        res.headers.should.have.property('etag');
        assert.response(
          app,
          { url: '/user.json' },
          function(res) {
            res.statusCode.should.equal(200);
            res.headers.should.have.property('date');
            res.headers.should.have.property('last-modified');
            res.headers.should.have.property('etag');
          }
        );
      }
    );
  },

  'ifnonematch request': function() {
    assert.response(
      app,
      { url: '/user.json' },
      function(res) {
        res.statusCode.should.equal(200);
        res.headers.should.have.property('etag');
        assert.response(
          app,
          {
            url: '/user.json',
            headers: {
              "If-None-Match": res.headers.etag
            }
          },
          function(res) {
            res.statusCode.should.equal(304);
            res.headers.should.have.property('date');
            res.headers.should.have.property('last-modified');
            res.headers.should.have.property('etag');
          }
        );
      }
    );
  },

  'old if-none-match request': function() {
    assert.response(
      app,
      { url: '/user.json' },
      function(res) {
        res.statusCode.should.equal(200);
        res.headers.should.have.property('etag');
        assert.response(
          app,
          { url: '/user.json',
            headers: {
              'If-None-Match': 'foobar'
            }
          },
          function(res) {
            res.statusCode.should.equal(200);
            res.headers.should.have.property('date');
            res.headers.should.have.property('last-modified');
            res.headers.should.have.property('etag');
          }
        );
      }
    );
  },

  'if-modified since request': function() {
    assert.response(
      app,
      { url: '/user.json' },
      function(res) {
        res.statusCode.should.equal(200);
        res.headers.should.have.property('last-modified');
        console.log(res.headers['last-modified']);
        assert.response(
          app,
          {
            url: '/user.json',
            headers: {
              'If-Modified-Since': res.headers['last-modified']
            }
          },
          function(res) {
            res.statusCode.should.equal(304);
            res.headers.should.have.property('date');
            res.headers.should.have.property('last-modified');
            res.headers.should.have.property('etag');
          }
        );
      }
    );
  },

  'old if-modified-since request': function() {
    assert.response(
      app2,
      { url: '/user.json' },
      function(res) {
        res.statusCode.should.equal(200);
        res.headers.should.have.property('last-modified');
        res.headers.should.have.property('etag');
        assert.response(
          app2,
          {
            url: '/user.json',
            headers: {
              'If-Modified-Since': 'Sat, 29 Oct 1994 19:43:31 GMT'
            }
          },
          function(res) {
            res.statusCode.should.equal(200);
            res.headers.should.have.property('date');
            res.headers.should.have.property('last-modified');
            res.headers.should.have.property('etag');
          }
        );
      }
    );
  },

  'no-cache request': function() {
    assert.response(
      app,
      { url: '/user.json' },
      function(res) {
        res.statusCode.should.equal(200);
        res.headers.should.have.property('etag');
        assert.response(
          app,
          {
            url: '/user.json',
            headers: {
              'Cache-Control': 'no-cache, max-age=0',
              'If-None-Match': res.headers.etag
            }
          },
          function(res) {
            res.statusCode.should.equal(304);
            res.headers.should.have.property('date');
            res.headers.should.have.property('last-modified');
            res.headers.should.have.property('etag');
          }
        );
      }
    );
  }
};