
var assert = require('assert');
var connect = require('..');
var http = require('http');
var rawrequest = require('./support/rawagent')

describe('app.use()', function(){
  var app;

  beforeEach(function(){
    app = connect();
  });

  it('should not obscure FQDNs', function(done){
    app.use(function(req, res){
      res.end(req.url);
    });

    rawrequest(app)
      .get('http://example.com/foo')
      .expect(200, 'http://example.com/foo', done)
  });

  describe('with a connect app', function(){
    it('should ignore FQDN in search', function (done) {
      app.use('/proxy', function (req, res) {
        res.end(req.url);
      });

      rawrequest(app)
        .get('/proxy?url=http://example.com/blog/post/1')
        .expect(200, '/?url=http://example.com/blog/post/1', done)
    });

    it('should ignore FQDN in path', function (done) {
      app.use('/proxy', function (req, res) {
        res.end(req.url);
      });

      rawrequest(app)
        .get('/proxy/http://example.com/blog/post/1')
        .expect(200, '/http://example.com/blog/post/1', done)
    });

    it('should adjust FQDN req.url', function(done){
      app.use('/blog', function(req, res){
        res.end(req.url);
      });

      rawrequest(app)
        .get('http://example.com/blog/post/1')
        .expect(200, 'http://example.com/post/1', done)
    });

    it('should adjust FQDN req.url with multiple handlers', function(done){
      app.use(function(req,res,next) {
        next();
      });

      app.use('/blog', function(req, res){
        res.end(req.url);
      });

      rawrequest(app)
        .get('http://example.com/blog/post/1')
        .expect(200, 'http://example.com/post/1', done)
    });

    it('should adjust FQDN req.url with multiple routed handlers', function(done) {
      app.use('/blog', function(req,res,next) {
        next();
      });
      app.use('/blog', function(req, res) {
        res.end(req.url);
      });

      rawrequest(app)
        .get('http://example.com/blog/post/1')
        .expect(200, 'http://example.com/post/1', done)
    });
  });
});
