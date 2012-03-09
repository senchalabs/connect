
var connect = require('../')
  , http = require('http');

var writeDummyResponse = function(sock) {
  sock.end('HTTP/1.1 101 Switching Protocols\r\n' +
           'Upgrade: dummy\r\n' +
           'Connection: Upgrade\r\n' +
           '\r\n' +
           'Hello world!');
};

describe('HTTP Upgrade requests', function(){
  var app;

  beforeEach(function(){
    app = connect();
  });

  describe('with middleware', function(){
    it('should call the upgrade handler', function(done){
      var hello = function(req, res, next){ next(); };
      hello.upgrade = function(req, sock, head, next){
        req.url.should.equal('/');
        writeDummyResponse(sock);
      };

      app.use('/hello', hello);

      app.request()
      .upgrade('dummy')
      .get('/hello')
      .expect(101, done);
    });
  });

  describe('with a connect app', function(){
    it('should call the upgrade handler', function(done){
      var hello = function(req, res, next){ next(); };
      hello.upgrade = function(req, sock, head, next){
        req.url.should.equal('/');
        writeDummyResponse(sock);
      };

      var subapp = connect().use(hello);
      app.use('/hello', subapp);

      app.request()
      .upgrade('dummy')
      .get('/hello')
      .expect(101, done);
    });
  });

  describe('with a node app', function(){
    it('should call the upgrade listener', function(done){
      var server = http.createServer(function(req, res){ res.end(); });
      server.on('upgrade', function(req, sock, head){
        req.url.should.equal('/');
        writeDummyResponse(sock);
      });

      app.use('/hello', server);

      app.request()
      .upgrade('dummy')
      .get('/hello')
      .expect(101, done);
    });
  });

  describe('without an upgrade handler', function(){
    it('should close the socket', function(done){
      app.request()
      .upgrade('dummy')
      .get('/hello')
      .end(function(err, body){
        err.message.should.equal('socket hang up');
        done();
      });
    });
  });

})
