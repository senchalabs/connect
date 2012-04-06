
var connect = require('../');
var http    = require('http');

describe('A Connect app,', function() {

  var app;
  var validateRequest;

  describe('when used directly,', function() {

    before(function() {
      app = connect();
      app.use(function(req, res){
        res.end();
      });
      validateRequest = function(done) {
          app
          .request('/')
          .expect(200, done);
        };
    });

    it('should be a requestListener for http.Server', function(done){
      http
        .createServer(app)
        .listen(0, validateRequest(done));
    });

    describe('app#listen()', function() {

      it('should wrap in an http.Server', function(done){
        app.listen(0, validateRequest(done));
      });

    });

  });


  describe('when extended similar to Express,', function() {

    var fakeExpress = function() {
      var app = connect();
      app.init = function() { this.initialized = true; };
      app._handle = app.handle;
      app.handle = function() {
        this.handled = true;
        this._handle.apply(this, arguments);
      };
      app.init();
      return app;
    };

    before(function() {
      app = fakeExpress();
      app.use(function(req, res){
        res.end();
      });
      validateRequest = function(done) {
          app
          .request('/')
          .expect(200, function() {
            app.should.have.property('initialized');
            app.initialized.should.be.true;
            app.should.have.property('handled');
            app.handled.should.be.true;
            done();
          });
        };
    });

    it('should be a requestListener for http.Server, and call any `handle` overrides', function(done){
      http
        .createServer(app)
        .listen(0, validateRequest(done));
    });

    describe('app#listen()', function() {

      it('should wrap in an http.Server, and call any `handle` overrides', function(done){
        app.listen(0, validateRequest(done));
      });

      it('should safely call any `listen` override', function(done){
        // Override with Express-ish listen function
        app.listen = function() {
          this.listened = true;
          var server = http.Server(this);
          return server.listen.apply(server, arguments);
        };
        app.listen(0, validateRequest(function() {
          app.should.have.property('listened');
          app.listened.should.be.true;
          done();
        }));
      });

    });

  });

  describe('when extended with a subclass,', function() {

    function SubClass() {
      this.subinitialized = true;
    }
    SubClass.prototype = connect();
    SubClass.prototype._handle = SubClass.prototype.handle;
    SubClass.prototype.handle = function() {
      this.subhandled = true;
      this._handle.apply(this, arguments);
    };

    before(function() {
      app = new SubClass();
      app.use(function(req, res){
        res.end();
      });
      validateRequest = function(done) {
          app
          .request('/')
          .expect(200, function() {
            app.should.have.property('subinitialized');
            app.subinitialized.should.be.true;
            app.should.have.property('subhandled');
            app.subhandled.should.be.true;
            done();
          });
        };
    });

    it('should throw an exception when used as a requestListener for http.Server', function(done){
      (function() {
        http
          .createServer(app)
          .listen(0, function() {
            fail();
            done();
          });
        }).should.throw('addListener only takes instances of Function');
      done();
    });

    describe('app#listen()', function() {

      it('should wrap in an http.Server, and call any `handle` overrides', function(done){
        app.listen(0, validateRequest(done));
      });

    });

  });

});
