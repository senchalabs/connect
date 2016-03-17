'use strict';

const http = require('http');
const assert = require('assert');

module.exports = function rawrequest(app) {
  const server = http.createServer(app.wrapper());
  let _path;

  function expect(status, body, callback) {
    server.listen(function() {
      const addr = this.address();
      const hostname = addr.family === 'IPv6' ? '::1' : '127.0.0.1';
      const port = addr.port;

      const req = http.get({
        host: hostname,
        path: _path,
        port: port
      });
      req.on('response', res => {
        let buf = '';

        res.setEncoding('utf8');
        res.on('data', s => buf += s);
        res.on('end', () => {
          let err = null;

          try {
            assert.equal(res.statusCode, status);
            assert.equal(buf, body);
          } catch (e) {
            err = e;
          }

          server.close();
          callback(err);
        });
      });
    });
  }

  function get(path) {
    _path = path;

    return {
      expect: expect
    };
  }

  return {
    get: get
  };
};
