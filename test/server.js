
var connect = require('../');

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

  it('should call error handler when nobody handled the request', function(done) {
    var app = connect();
    app.use(function(err, req, res, next) {
      if (err.status) res.statusCode = err.status;
      res.end('CustomHandled' + err.toString());
    });
    app.request()
      .get('/not-found')
      .end(function(res) {
        res.statusCode.should.equal(404);
        res.body.should.equal('CustomHandledError: Cannot GET /not-found');
        done();
      });
  })

  it('should handle misbehaving error handler when nobody handled the request', function(done) {
    var app = connect();
    app.use(function(err, req, res, next) {
      // swallow the error
      next();
    });
    app.request()
      .get('/not-found')
      .expect(404, done);
  })
})
