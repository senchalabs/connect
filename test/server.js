
process.env.NODE_ENV = 'test';

var connect = require('../');
var request = require('./support/http');
var should = require('should');

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

    request(app)
    .get('http://example.com/foo')
    .expect('http://example.com/foo', done);
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

  it('should escape the 500 response body', function(done){
    var app = connect();
    app.use(function(req, res, next){
      next(new Error('error!'));
    });
    request(app)
    .get('/')
    .end(function(res){
      res.statusCode.should.eql(500);
      res.body.should.containEql('Error: error!<br>');
      res.body.should.containEql('<br> &nbsp; &nbsp;at');
      done();
    });
  })

  it('should escape the 404 response body', function(done){
    var app = connect();
    request(app)
    .get('/foo/<script>stuff</script>')
    .expect('Cannot GET /foo/&lt;script&gt;stuff&lt;/script&gt;\n', done);
  })
})
