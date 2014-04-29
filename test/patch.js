
var connect = require('../');
var utils = require('../lib/utils');

describe('patch', function(){
  describe('res', function(){
    describe('cookie', function(){
      it('should set a cookie', function(done){
        var app = connect();

        app.use(function(req, res){
          res.cookie('name', 'tobi');
          res.end();
        });

        app.request()
        .get('/')
        .end(function(res){
          res.headers['set-cookie'].should.eql(['name=tobi; Path=/']);
          done();
        })
      })

      it('should accept options', function(done){
        var app = connect();

        app.use(function(req, res){
          res.cookie('name', 'tobi', { httpOnly: true, secure: true });
          res.end();
        });

        app.request()
        .get('/')
        .end(function(res){
          res.headers['set-cookie'].should.eql(['name=tobi; Path=/; HttpOnly; Secure']);
          done();
        })
      })

      it('should accept maxAge', function(done){
        var app = connect();

        app.use(function(req, res){
          res.cookie('name', 'tobi', { maxAge: 1000 });
          res.end();
        });

        app.request()
        .get('/')
        .end(function(res){
          res.headers['set-cookie'][0].should.not.include('Thu, 01 Jan 1970 00:00:01 GMT');
          res.headers['set-cookie'][0].should.include('Max-Age=1');
          done();
        })
      })

      it('should not mutate the options object', function(done){
        var app = connect();

        var options = { maxAge: 1000 };
        var optionsCopy = utils.merge({}, options);

        app.use(function(req, res){
          res.cookie('name', 'tobi', options)
          res.end();
        });

        app.request()
        .get('/')
        .end(function(res){
          options.should.eql(optionsCopy);
          done();
        })
      })
    })

    describe('headerSent', function(){
      it('should match res._header Boolean status', function(done){
        var app = connect();

        app.use(function(req, res){
          res.setHeader('x-header-sent', String(res.headerSent));
          res.write('');
          res.write(String(res.headerSent));
          res.end();
        })

        app.request()
        .get('/')
        .end(function(res){
          res.body.should.equal('true');
          res.should.have.header('x-header-sent', 'false');
          done();
        });
      })
    })

    describe('headersSent', function(){
      it('should match res._header Boolean status', function(done){
        var app = connect();

        app.use(function(req, res){
          res.setHeader('x-header-sent', String(res.headersSent));
          res.write('');
          res.write(String(res.headersSent));
          res.end();
        })

        app.request()
        .get('/')
        .end(function(res){
          res.body.should.equal('true');
          res.should.have.header('x-header-sent', 'false');
          done();
        });
      })
    })
  })

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
  })

  describe('res.setHeader', function(){
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
