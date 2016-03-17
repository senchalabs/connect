'use strict';

const assert = require('assert');
const connect = require('..');
const rawrequest = require('./support/rawrequest');
const http = require('http');

describe('app.use()', () => {
  let app;

  beforeEach(() => {
    app = new connect();
  });

  it('should not obscure FQDNs', done => {
    app.use((req, res) => {
      res.end(req.url);
    });

    rawrequest(app)
      .get('http://example.com/foo')
      .expect(200, 'http://example.com/foo', done);
  });

  describe('with a connect app', () => {
    it('should ignore FQDN in search', done => {
      app.use('/proxy', (req, res) => {
        res.end(req.url);
      });

      rawrequest(app)
        .get('/proxy?url=http://example.com/blog/post/1')
        .expect(200, '/?url=http://example.com/blog/post/1', done);
    });

    it('should ignore FQDN in path', done => {
      app.use('/proxy', (req, res) => {
        res.end(req.url);
      });

      rawrequest(app)
        .get('/proxy/http://example.com/blog/post/1')
        .expect(200, '/http://example.com/blog/post/1', done);
    });

    it('should adjust FQDN req.url', done => {
      app.use('/blog', (req, res) => {
        res.end(req.url);
      });

      rawrequest(app)
        .get('http://example.com/blog/post/1')
        .expect(200, 'http://example.com/post/1', done);
    });

    it('should adjust FQDN req.url with multiple handlers', done => {
      app.use(function(req, res, next) {
        next();
      });

      app.use('/blog', (req, res) => {
        res.end(req.url);
      });

      rawrequest(app)
        .get('http://example.com/blog/post/1')
        .expect(200, 'http://example.com/post/1', done);
    });

    it('should adjust FQDN req.url with multiple routed handlers', function(done) {
      app.use('/blog', function(req, res, next) {
        next();
      });
      app.use('/blog', function(req, res) {
        res.end(req.url);
      });

      rawrequest(app)
        .get('http://example.com/blog/post/1')
        .expect(200, 'http://example.com/post/1', done);
    });
  });
});
