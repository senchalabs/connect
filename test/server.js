
process.env.NODE_ENV = 'test';

var connect = require('../')

describe('app', function(){
  it('should inherit from event emitter', function(done){
    var app = connect();
    app.on('foo', done);
    app.emit('foo');
  })

  it('should not obscure FQDNs', function(done){
    var app = connect();

    app.use(function(req, res){
      res.end(req.url);
    });

    app.request()
    .get('http://example.com/foo')
    .expect('http://example.com/foo', done);
  })

  it('should allow old-style constructor middleware', function(done){
    var app = connect(
        connect.json()
      , connect.multipart()
      , connect.urlencoded()
      , function(req, res){ res.end(JSON.stringify(req.body)) });

    app.stack.should.have.length(4);

    app.request()
      .post('/')
      .set('Content-Type', 'application/json')
      .write('{"foo":"bar"}')
      .expect('{"foo":"bar"}', done);
  })

  it('should allow old-style .createServer()', function(){
    var app = connect.createServer(
        connect.json()
      , connect.multipart()
      , connect.urlencoded());

    app.stack.should.have.length(3);
  })

  it('should work as middlware', function(done){
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
  })

  describe('404 handler', function(){
    it('should have escaped response body', function(done){
      var app = connect();
      app.request()
      .get('/foo/<script>stuff</script>')
      .expect('Cannot GET /foo/&lt;script&gt;stuff&lt;/script&gt;\n', done);
    })

    it('shoud not fire after headers sent', function(done){
      var app = connect();

      app.use(function(req, res, next){
        res.write('body');
        res.end();
        process.nextTick(next);
      })

      app.request()
      .get('/')
      .expect(200, done);
    })

    it('shoud have no body for HEAD', function(done){
      var app = connect();

      app.request()
      .head('/')
      .expect('', done);
    })
  })

  describe('error handler', function(){
    it('should have escaped response body', function(done){
      var app = connect();

      app.use(function(req, res, next){
        throw new Error('<script>alert()</script>');
      })

      app.request()
      .get('/')
      .end(function(res){
        res.body.should.containEql('&lt;script&gt;alert()&lt;/script&gt;');
        done();
      });
    })

    it('should use custom error code', function(done){
      var app = connect();

      app.use(function(req, res, next){
        var err = new Error('ack!');
        err.status = 503;
        throw err;
      })

      app.request()
      .get('/')
      .expect(503, done);
    })

    it('should keep error statusCode', function(done){
      var app = connect();

      app.use(function(req, res, next){
        res.statusCode = 503;
        throw new Error('ack!');
      })

      app.request()
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

      app.request()
      .get('/')
      .expect(200, done);
    })

    it('shoud have no body for HEAD', function(done){
      var app = connect();

      app.use(function(req, res, next){
        throw new Error('ack!');
      });

      app.request()
      .head('/')
      .expect('', done);
    })
  })
})
