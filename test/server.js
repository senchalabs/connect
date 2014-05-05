
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
    });
  });
});
