
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
         res.headers.should.have.property('content-length', '55');
         res.headers.should.have.property('cache-control', 'public max-age=0');
         res.headers.should.have.property('last-modified');
         res.headers.should.have.property('etag');
     });
   },
    
  'test maxAge': function(){
    var app = connect.createServer(
      connect.static(fixturesPath, { maxAge: 60000 })
    );
  
    assert.response(app,
      { url: '/user.json' },
      function(res){
        res.statusCode.should.equal(200);
        res.headers.should.have.property('cache-control', 'public max-age=60');
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
      { body: '<p>Wahoo!</p>'
      , status: 200
      , headers: {
        'Content-Type': 'text/html'
      }});
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
      { url: '/../favicon.test.js' },
      { body: 'Forbidden', status: 403 });
  },
  
  'test forbidden urlencoded': function(){
    assert.response(app,
      { url: '/%2e%2e/favicon.test.js' },
      { body: 'Forbidden', status: 403 });
  },
  
  'test HEAD': function(){
    assert.response(app,
      { url: '/user.json', method: 'HEAD' },
      { status: 200, headers: { 'Content-Length': '55' }});
  },
  
  'test Range': function(){
    assert.response(app,
      { url: '/list', headers: { Range: 'bytes=0-4' }},
      { body: '12345', status: 206 });
  },
  
  'test Range 2': function(){
    assert.response(app,
      { url: '/list', headers: { Range: 'bytes=5-9' }},
      { body: '6789', status: 206 });
  },
  
  'test invalid Range': function(){
    assert.response(app,
      { url: '/list', headers: { Range: 'bytes=RAWR' }},
      { body: 'Requested Range Not Satisfiable', status: 416 });
  },
  
  'test callback': function(){
    var app = connect.createServer(
      function(req, res, next){
        connect.static.send(req, res, function(err){
          res.end('done');
        }, { path: req.url });
      }
    );

    assert.response(app,
      { url: '/list' },
      { body: 'done' });
  },
  
  'test If-Modified-Since modified': function(){
    assert.response(app,
      { url: '/list', headers: { 'If-Modified-Since': new Date('2000').toUTCString() }},
      { body: '123456789', status: 200 });
  },
  
  'test If-Modified-Since unmodified': function(){
    assert.response(app,
      { url: '/list', headers: { 'If-Modified-Since': new Date('2050').toUTCString() }},
      { body: '', status: 304 },
      function(res){
        Object.keys(res.headers).forEach(function(field){
          if (0 == field.indexOf('content')) {
            should.fail('failed to strip ' + field);
          }
        });
      });
  },
  
  'test ETag unmodified': function(){
    var app = connect.createServer(
      connect.static(fixturesPath)
    );

    app.listen(9898, function(){
      var options = { path: '/list', port: 9898, host: '127.0.0.1' };
      http.get(options, function(res){
        res.statusCode.should.equal(200);
        res.headers.should.have.property('etag');
        var etag = res.headers.etag;
        options.headers = { 'If-None-Match': etag };
        http.get(options, function(res){
          etag.should.equal(res.headers.etag);
          res.statusCode.should.equal(304);
          res.headers.should.not.have.property('content-length');
          res.headers.should.not.have.property('content-type');
          app.close();
        });
      });
    });
  },
  
  'test ETag multiple given, unmodified': function(){
    var app = connect.createServer(
      connect.static(fixturesPath)
    );

    app.listen(9899, function(){
      var options = { path: '/list', port: 9899, host: '127.0.0.1' };
      http.get(options, function(res){
        res.statusCode.should.equal(200);
        res.headers.should.have.property('etag');
        var etag = res.headers.etag;
        options.headers = { 'If-None-Match': 'foo, bar, ' + etag };
        http.get(options, function(res){
          etag.should.equal(res.headers.etag);
          res.statusCode.should.equal(304);
          res.headers.should.not.have.property('content-length');
          res.headers.should.not.have.property('content-type');
          app.close();
        });
      });
    });
  }
};