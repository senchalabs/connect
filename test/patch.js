
var connect = require('../');

describe('patch', function(){
  describe('"header" event', function(){
    describe('with .setHeader()', function(){
      it('should be emitted', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.on('header', function(){
            res.setHeader('bar', 'baz');
          });

          next();
        });

        app.use(function(req, res){
          res.setHeader('foo', 'bar');
          res.end();
        })

        app.request()
        .get('/')
        .end(function(res){
          res.should.have.header('foo', 'bar');
          res.should.have.header('bar', 'baz');
          done();
        });
      })
    })

    describe('with .writeHead()', function(){
      it('should be emitted', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.on('header', function(){
            res.setHeader('bar', 'baz');
          });

          next();
        });

        app.use(function(req, res){
          res.writeHead(200, { foo: 'bar' });
          res.end();
        })

        app.request()
        .get('/')
        .end(function(res){
          res.should.have.header('foo', 'bar');
          res.should.have.header('bar', 'baz');
          done();
        });
      })

      it('should have headers without reasonPhrase', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.on('header', function(){
            if (!this.getHeader('content-length')) throw new Error();
          });

          res.writeHead(200, {
            'content-length': '2'
          });

          res.end('ok');
        })

        app.request()
        .get('/')
        .expect(200, done);
      })

      it('should have headers with reasonPhrase', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.on('header', function(){
            if (!this.getHeader('content-length')) throw new Error();
          });

          res.writeHead(200, 'haha', {
            'content-length': '2'
          });

          res.end('ok');
        })

        app.request()
        .get('/')
        .expect(200, done);
      })
    })

    describe('with .end() only', function(){
      it('should be emitted', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.on('header', function(){
            res.setHeader('bar', 'baz');
          });

          next();
        });

        app.use(function(req, res){
          res.end();
        })

        app.request()
        .get('/')
        .end(function(res){
          res.should.have.header('bar', 'baz');
          done();
        });
      })
    })

    describe('should handle set-cookie setting multiple cookies as array', function(){
      it('should be emitted', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.on('header', function(){
            res.setHeader('Set-Cookie', ['foo1', 'bar1']);
            res.setHeader('Set-Cookie', ['foo2', 'bar2']);
          });

          next();
        });

        app.use(function(req, res){
          res.end();
        })

        app.request()
        .get('/')
        .end(function(res){
          res.headers['set-cookie'].should.include('foo1');
          res.headers['set-cookie'].should.include('bar1');
          res.headers['set-cookie'].should.include('foo2');
          res.headers['set-cookie'].should.include('bar2');
          done();
        });
      })
    })

    describe('should handle set-cookie setting multiple cookies as array and string', function(){
      it('should be emitted', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.on('header', function(){
            res.setHeader('Set-Cookie', ['foo1', 'bar1']);
            res.setHeader('Set-Cookie', 'foo2');
          });

          next();
        });

        app.use(function(req, res){
          res.end();
        })

        app.request()
        .get('/')
        .end(function(res){
          res.headers['set-cookie'].should.include('foo1');
          res.headers['set-cookie'].should.include('bar1');
          res.headers['set-cookie'].should.include('foo2');
          done();
        });
      })
    })
  })
})
