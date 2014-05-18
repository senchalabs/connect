
process.env.NODE_ENV = 'test';

var connect = require('..');
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

  it('should work as middleware', function(done){
    var http = require('http');

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
      app.handle({ method: 'GET', url: '/foo/<script>stuff</script>' }, {
        setHeader: function(){},
        end: function(str){
          this.statusCode.should.equal(404);
          str.should.equal('Cannot GET /foo/&lt;script&gt;stuff&lt;/script&gt;\n');
          done();
        }
      });
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
