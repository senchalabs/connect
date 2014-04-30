
process.env.NODE_ENV = 'test';

var connect = require('..');
var http = require('http');
var request = require('supertest');

describe('app.use()', function(){
  var app;

  beforeEach(function(){
    app = connect();
  });

  it('should not obscure FQDNs', function(done){
    app.use(function(req, res){
      res.end(req.url);
    });

    app.handle({ method: 'GET', url: 'http://example.com/foo' }, {
      end: function(str){
        str.should.equal('http://example.com/foo');
        done();
      }
    });
  });

  describe('with a connect app', function(){
    it('should ignore FQDN in search', function (done) {
      app.use('/proxy', function (req, res) {
        res.end(req.url);
      });

      app.handle({ method: 'GET', url: '/proxy?url=http://example.com/blog/post/1' }, {
        end: function(str){
          str.should.equal('/?url=http://example.com/blog/post/1');
          done();
        }
      });
    });

    it('should adjust FQDN req.url', function(done){
      app.use('/blog', function(req, res){
        res.end(req.url);
      });

      app.handle({ method: 'GET', url: 'http://example.com/blog/post/1' }, {
        end: function(str){
          str.should.equal('http://example.com/post/1');
          done();
        }
      });
    });

    it('should adjust FQDN req.url with multiple handlers', function(done){
      app.use(function(req,res,next) {
        next();
      });

      app.use('/blog', function(req, res){
        res.end(req.url);
      });

      app.handle({ method: 'GET', url: 'http://example.com/blog/post/1' }, {
        end: function(str){
          str.should.equal('http://example.com/post/1');
          done();
        }
      });
    });

    it('should adjust FQDN req.url with multiple routed handlers', function(done) {
      app.use('/blog', function(req,res,next) {
        next();
      });
      app.use('/blog', function(req, res) {
        res.end(req.url);
      });

      app.handle({ method: 'GET', url: 'http://example.com/blog/post/1' }, {
        end: function(str){
          str.should.equal('http://example.com/post/1');
          done();
        }
      });
    });
  });
});
