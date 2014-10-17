
var connect = require('../');
var merge = require('utils-merge');

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
          res.headers['set-cookie'][0].should.not.containEql('Thu, 01 Jan 1970 00:00:01 GMT');
          res.headers['set-cookie'][0].should.containEql('Max-Age=1');
          done();
        })
      })

      it('should not mutate the options object', function(done){
        var app = connect();

        var options = { maxAge: 1000 };
        var optionsCopy = merge({}, options);

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

    describe('appendHeader', function(){
      // note about these tests: "Link" and "X-*" are chosen because
      // the common node.js versions white list which _incoming_
      // headers can appear multiple times; there is no such white list
      // for outgoing, though
      it('should append multiple headers', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.appendHeader('Link', '<http://localhost/>');
          next();
        });

        app.use(function(req, res){
          res.appendHeader('Link', '<http://localhost:80/>');
          res.end();
        });

        app.request()
        .get('/')
        .expect('Link', '<http://localhost/>, <http://localhost:80/>', done)
      })

      it('should get reset by setHeader', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.appendHeader('Link', '<http://localhost/>');
          res.appendHeader('Link', '<http://localhost:80/>');
          next();
        });

        app.use(function(req, res){
          res.setHeader('Link', '<http://127.0.0.1/>');
          res.end();
        });

        app.request()
        .get('/')
        .expect('Link', '<http://127.0.0.1/>', done)
      })

      it('should work with setHeader first', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.setHeader('Link', '<http://localhost/>');
          next();
        });

        app.use(function(req, res){
          res.appendHeader('Link', '<http://localhost:80/>');
          res.end();
        });

        app.request()
        .get('/')
        .expect('Link', '<http://localhost/>, <http://localhost:80/>', done)
      })

      it('should work with array', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.setHeader('Link', '<http://localhost/>');
          next();
        });

        app.use(function(req, res){
          res.appendHeader('Link', ['<http://localhost:80/>', '<http://localhost:8080/>']);
          res.end();
        });

        app.request()
        .get('/')
        .expect('Link', '<http://localhost/>, <http://localhost:80/>, <http://localhost:8080/>', done)
      })

      it('should work with cookies', function(done){
        var app = connect();

        app.use(function(req, res, next){
          res.cookie('foo', 'bar');
          next();
        });

        app.use(function(req, res){
          res.appendHeader('Set-Cookie', 'bar=baz');
          res.end();
        });

        app.request()
        .get('/')
        .expect('Set-Cookie', ['foo=bar; Path=/', 'bar=baz'], done)
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
          res.headers.should.have.property('x-header-sent', 'false');
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
          res.headers.should.have.property('x-header-sent', 'false');
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
          res.headers.should.have.property('foo', 'bar');
          res.headers.should.have.property('bar', 'baz');
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
          res.headers.should.have.property('foo', 'bar');
          res.headers.should.have.property('bar', 'baz');
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
        .expect('bar', 'baz', done);
      })
    })
  })

  describe('res.setHeader', function(){
    it('should include charset in content-type', function(done){
      var app = connect();

      app.use(function(req, res){
        res.charset = 'utf-8';
        res.setHeader('content-type', 'application/x-bogus');
        res.end('hello!');
      })

      app.request()
      .get('/')
      .expect('content-type', 'application/x-bogus; charset=utf-8', done);
    })

    it('should not double-include charset in content-type', function(done){
      var app = connect();

      app.use(function(req, res){
        res.charset = 'utf-8';
        res.setHeader('content-type', 'application/x-bogus; charset=utf-8');
        res.end('hello!');
      })

      app.request()
      .get('/')
      .expect('content-type', 'application/x-bogus; charset=utf-8', done);
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
          res.headers['set-cookie'].should.containEql('foo1');
          res.headers['set-cookie'].should.containEql('bar1');
          res.headers['set-cookie'].should.containEql('foo2');
          res.headers['set-cookie'].should.containEql('bar2');
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
          res.headers['set-cookie'].should.containEql('foo1');
          res.headers['set-cookie'].should.containEql('bar1');
          res.headers['set-cookie'].should.containEql('foo2');
          done();
        });
      })
    })

    it('should detect full set-cookie', function(done){
      var app = connect();

      app.use(function(req, res, next){
        res.cookie('foo', 'bar');
        next();
      });

      app.use(function(req, res, next){
        res.cookie('bar', 'baz');
        next();
      });

      app.use(function(req, res){
        var prev = res.getHeader('Set-Cookie');
        res.setHeader('Set-Cookie', prev.concat('fizz=buzz'));
        res.end();
      });

      app.request()
      .get('/')
      .expect('Set-Cookie', ['foo=bar; Path=/', 'bar=baz; Path=/', 'fizz=buzz'], done)
    })
  })
})
