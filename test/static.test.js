
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
  , http = require('http');

/**
 * Path to ./test/fixtures/
 */

var fixturesPath = __dirname + '/fixtures';

var app = connect.createServer(
  connect.static(fixturesPath)
);

module.exports = {
  'test valid file': function(){
    assert.response(app,
      { url: '/user.json' },
      function(res){
        res.statusCode.should.equal(200);
        JSON.parse(res.body).should.eql({ name: 'tj', email: 'tj@vision-media.ca' });
        res.headers['content-length'].should.equal('55');
        res.headers['cache-control'].should.equal('public max-age=0');
        res.headers.should.have.property('last-modified');
    });
  },
  
  'test maxAge': function(){
    var app = connect.createServer(
      connect.static({ root: fixturesPath, maxAge: 60000 })
    );

    assert.response(app,
      { url: '/user.json' },
      function(res){
        res.statusCode.should.equal(200);
        JSON.parse(res.body).should.eql({ name: 'tj', email: 'tj@vision-media.ca' });
        res.headers['content-length'].should.equal('55');
        res.headers['cache-control'].should.equal('public max-age=60');
        res.headers.should.have.property('last-modified');
    });
  },
  
  'test url encoding': function(){
    assert.response(app,
      { url: '/some%20text.txt' },
      { body: 'whoop', status: 200 });
  },
  
  'test index.html support': function(){
    assert.response(app,
      { url: '/' },
      { body: '<p>Wahoo!</p>', status: 200 });
  },
  
  'test index.html support when missing': function(){
    var app = connect.createServer(
      connect.static(__dirname)
    );

    assert.response(app,
      { url: '/' },
      { body: 'Cannot GET /', status: 404 });
  },
  
  'test invalid file': function(){
    assert.response(app,
      { url: '/foo.json' },
      { body: 'Cannot GET /foo.json', status: 404 });
  },
  
  'test directory': function(){
    assert.response(app,
      { url: '/fixtures' },
      { body: 'Cannot GET /fixtures', status: 404 });
  },
  
  'test forbidden': function(){
    assert.response(app,
      { url: '/../gzip.test.js' },
      { body: 'Forbidden', status: 403 });
  },
  
  'test forbidden urlencoded': function(){
    assert.response(app,
      { url: '/%2e%2e/gzip.test.js' },
      { body: 'Forbidden', status: 403 });
  }
};