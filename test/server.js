'use strict';

const assert = require('assert');
const connect = require('..');
const rawrequest = require('./support/rawrequest');
const http = require('http');
const request = require('supertest');

describe('app', function() {
  let app;

  beforeEach(function() {
    app = new connect();
  });

  it('should inherit from event emitter', done => {
    app.on('foo', done);
    app.emit('foo');
  });

  it('should work in http.createServer', done => {
    const app = new connect();

    app.use((req, res) => res.end('hello, world!'));

    const server = http.createServer(app.wrapper());

    request(server)
      .get('/')
      .expect(200, 'hello, world!', done);
  });

  it('should be a callable function', done => {
    const app = new connect();

    app.use((req, res) => res.end('hello, world!'));

    function handler(req, res) {
      res.write('oh, ');
      app.handle(req, res);
    }

    const server = http.createServer(handler);

    request(server)
      .get('/')
      .expect(200, 'oh, hello, world!', done);
  });

  it('should invoke callback if request not handled', done => {
    const app = new connect();

    app.use('/foo', (req, res) => {
      res.end('hello, world!');
    });

    function handler(req, res) {
      res.write('oh, ');
      app.handle(req, res, () => {
        res.end('no!');
      });
    }

    const server = http.createServer(handler);

    request(server)
      .get('/')
      .expect(200, 'oh, no!', done);
  });

  it('should invoke callback on error', done => {
    const app = new connect();

    app.use(() => {
      throw new Error('boom!')
    });

    function handler(req, res) {
      res.write('oh, ');
      app.handle(req, res, err => res.end(err.message));
    }

    const server = http.createServer(handler);

    request(server)
      .get('/')
      .expect(200, 'oh, boom!', done);
  });

  it('should work as middleware', done => {
    // custom server handler array
    const handlers = [new connect().wrapper(), (req, res, next) => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Ok');
    }];

    // execute callbacks in sequence
    let n = 0;
    function run(req, res) {
      if (handlers[n]) {
        handlers[n++](req, res, () => run(req, res));
      }
    }

    // create a non-connect server
    const server = http.createServer(run);

    request(server)
      .get('/')
      .expect(200, 'Ok', done);
  });

  it('should escape the 500 response body', done => {
    app.use((req, res, next) => next(new Error('error!')));

    request(app.wrapper())
      .get('/')
      .expect(/Error: error!<br>/)
      .expect(/<br> &nbsp; &nbsp;at/)
      .expect(500, done);
  });

  describe('404 handler', () => {
    it('should escape the 404 response body', done => {
      rawrequest(app)
        .get('/foo/<script>stuff</script>')
        .expect(404, 'Cannot GET /foo/&lt;script&gt;stuff&lt;/script&gt;\n', done);
    });

    it('shoud not fire after headers sent', done => {
      const app = new connect();

      app.use((req, res, next) => {
        res.write('body');
        res.end();
        process.nextTick(next);
      });

      request(app.wrapper())
        .get('/')
        .expect(200, done);
    });

    it('shoud have no body for HEAD', done => {
      const app = new connect();

      request(app.wrapper())
        .head('/')
        .expect(404, '', done);
    })
  });

  describe('error handler', function() {
    it('should have escaped response body', done => {
      const app = new connect();

      app.use(() => {
        throw new Error('<script>alert()</script>');
      });

      request(app.wrapper())
        .get('/')
        .expect(500, /&lt;script&gt;alert\(\)&lt;\/script&gt;/, done);
    });

    it('should use custom error code', done => {
      const app = new connect();

      app.use(() => {
        const err = new Error('ack!');
        err.status = 503;
        throw err;
      });

      request(app.wrapper())
        .get('/')
        .expect(503, done);
    });

    it('should keep error statusCode', done => {
      const app = new connect();

      app.use((req, res, next) => {
        res.statusCode = 503;
        throw new Error('ack!');
      });

      request(app.wrapper())
        .get('/')
        .expect(503, done);
    });

    it('shoud not fire after headers sent', done => {
      const app = new connect();

      app.use((req, res, next) => {
        res.write('body');
        res.end();
        process.nextTick(() => next(new Error('ack!')));
      });

      request(app.wrapper())
        .get('/')
        .expect(200, done);
    });

    it('shoud have no body for HEAD', done => {
      const app = new connect();

      app.use(() => {
        throw new Error('ack!');
      });

      request(app.wrapper())
        .head('/')
        .expect(500, '', done);
    });
  });
});