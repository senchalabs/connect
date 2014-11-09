
var assert = require('assert');
var connect = require('..');
var http = require('http');
var request = require('supertest');
var should = require('should');

describe('app', function(){
  var app;

  beforeEach(function(){
    app = connect();
  });

  it('should inherit from event emitter', function(done){
    app.on('foo', done);
    app.emit('foo');
  });

  it('should work in http.createServer', function(done){
    var app = connect();

    app.use(function (req, res) {
      res.end('hello, world!');
    });

    var server = http.createServer(app);

    request(server)
    .get('/')
    .expect(200, 'hello, world!', done);
  })

  it('should be a callable function', function(done){
    var app = connect();

    app.use(function (req, res) {
      res.end('hello, world!');
    });

    function handler(req, res) {
      res.write('oh, ');
      app(req, res);
    }

    var server = http.createServer(handler);

    request(server)
    .get('/')
    .expect(200, 'oh, hello, world!', done);
  })

  it('should invoke callback if request not handled', function(done){
    var app = connect();

    app.use('/foo', function (req, res) {
      res.end('hello, world!');
    });

    function handler(req, res) {
      res.write('oh, ');
      app(req, res, function() {
        res.end('no!');
      });
    }

    var server = http.createServer(handler);

    request(server)
    .get('/')
    .expect(200, 'oh, no!', done);
  })

  it('should invoke callback on error', function(done){
    var app = connect();

    app.use(function (req, res) {
      throw new Error('boom!');
    });

    function handler(req, res) {
      res.write('oh, ');
      app(req, res, function(err) {
        res.end(err.message);
      });
    }

    var server = http.createServer(handler);

    request(server)
    .get('/')
    .expect(200, 'oh, boom!', done);
  })

  it('should work as middleware', function(done){
    // custom server handler array
    var handlers = [connect(), function(req, res, next){
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Ok');
    }];

    // execute callbacks in sequence
    var n = 0;
    function run(req, res){
      if (handlers[n]) {
        handlers[n++](req, res, function(){
          run(req, res);
        });
      }
    }

    // create a non-connect server
    var server = http.createServer(run).listen(5556, function(){
      http.get({
        host: 'localhost',
        port: 5556,
        path: '/'
      }, function(res){
        var buf = '';
        res.setEncoding('utf8');
        res.on('data', function(s){ buf += s });
        res.on('end', function(){
          buf.should.eql('Ok');
          server.close();
          done();
        });
      });
    });
  });

  it('should escape the 500 response body', function(done){
    app.use(function(req, res, next){
      next(new Error('error!'));
    });
    request(app)
    .get('/')
    .expect(/Error: error!<br>/)
    .expect(/<br> &nbsp; &nbsp;at/)
    .expect(500, done);
  })

  describe('404 handler', function(){
    it('should escape the 404 response body', function(done){
      rawrequest(app)
      .get('/foo/<script>stuff</script>')
      .expect(404, 'Cannot GET /foo/&lt;script&gt;stuff&lt;/script&gt;\n', done);
    });

    it('shoud not fire after headers sent', function(done){
      var app = connect();

      app.use(function(req, res, next){
        res.write('body');
        res.end();
        process.nextTick(next);
      })

      request(app)
      .get('/')
      .expect(200, done);
    })

    it('shoud have no body for HEAD', function(done){
      var app = connect();

      request(app)
      .head('/')
      .expect(404, '', done);
    })
  })

  describe('error handler', function(){
    it('should have escaped response body', function(done){
      var app = connect();

      app.use(function(req, res, next){
        throw new Error('<script>alert()</script>');
      })

      request(app)
      .get('/')
      .expect(500, /&lt;script&gt;alert\(\)&lt;\/script&gt;/, done);
    })

    it('should use custom error code', function(done){
      var app = connect();

      app.use(function(req, res, next){
        var err = new Error('ack!');
        err.status = 503;
        throw err;
      })

      request(app)
      .get('/')
      .expect(503, done);
    })

    it('should keep error statusCode', function(done){
      var app = connect();

      app.use(function(req, res, next){
        res.statusCode = 503;
        throw new Error('ack!');
      })

      request(app)
      .get('/')
      .expect(503, done);
    })

    it('shoud not fire after headers sent', function(done){
      var app = connect();

      app.use(function(req, res, next){
        res.write('body');
        res.end();
        process.nextTick(function() {
          next(new Error('ack!'));
        });
      })

      request(app)
      .get('/')
      .expect(200, done);
    })

    it('shoud have no body for HEAD', function(done){
      var app = connect();

      app.use(function(req, res, next){
        throw new Error('ack!');
      });

      request(app)
      .head('/')
      .expect(500, '', done);
    });
  });
});

function rawrequest(app) {
  var _path;
  var server = http.createServer(app);

  function expect(status, body, callback) {
    server.listen(function(){
      var addr = this.address();
      var hostname = addr.family === 'IPv6' ? '[::1]' : '127.0.0.1';
      var port = addr.port;

      var req = http.get({
        host: hostname,
        path: _path,
        port: port
      });
      req.on('response', function(res){
        var buf = '';

        res.setEncoding('utf8');
        res.on('data', function(s){ buf += s });
        res.on('end', function(){
          var err = null;

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
}
