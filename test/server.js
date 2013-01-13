
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

    // execute handlers one after another
    var curHandler = 0;
    var execHandler = function(req, res){
      if (handlers[curHandler])
        handlers[curHandler++](req, res, function(){
          execHandler(req, res);
        });
    }

    // create a non-connect server
    var server = http.createServer(execHandler).listen(5556, function(){
      // test it out
      http.get({
        host: 'localhost',
        port: 5556,
        path: '/'
      }, function(res){
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function(chunk){
          data += chunk;
        });
        res.on('end', function(){
          data.should.eql('Ok');
          server.close();
          done();
        });
      });
    });
  })

  it('should escape the 404 response body', function(done){
    var app = connect();
    app.request()
    .get('/foo/<script>stuff</script>')
    .expect('Cannot GET /foo/&lt;script&gt;stuff&lt;/script&gt;', done);
  })
})
