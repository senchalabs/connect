
var connect = require('../')
  , should = require('./shared');

var app = connect();

app.use(connect.multipart({ limit: '20mb' }));

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

describe('connect.multipart()', function(){
  should['default request body'](app);
  should['limit body to']('20mb', 'multipart/form-data', app);

  it('should ignore GET', function(done){
    app.request()
    .get('/')
    .set('Content-Type', 'multipart/form-data; boundary=foo')
    .write('--foo\r\n')
    .write('Content-Disposition: form-data; name="user"\r\n')
    .write('\r\n')
    .write('Tobi')
    .write('\r\n--foo--')
    .end(function(res){
      res.body.should.equal('{}');
      done();
    });
  })

  describe('with multipart/form-data', function(){
    it('should populate req.body', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{"user":"Tobi"}');
        done();
      });
    })
    
    it('should support files', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        req.body.user.should.eql({ name: 'Tobi' });
        req.files.text.path.should.not.include('.txt');
        req.files.text.constructor.name.should.equal('File');
        res.end(req.files.text.name);
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name]"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('foo.txt');
        done();
      });
    })
    
    it('should expose options to formidable', function(done){
      var app = connect();

      app.use(connect.multipart({
        keepExtensions: true
      }));

      app.use(function(req, res){
        req.body.user.should.eql({ name: 'Tobi' });
        req.files.text.path.should.include('.txt');
        req.files.text.constructor.name.should.equal('File');
        res.end(req.files.text.name);
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name]"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('foo.txt');
        done();
      });
    })
    
    it('should work with multiple fields', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user"\r\n')
      .write('\r\n')
      .write('Tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="age"\r\n')
      .write('\r\n')
      .write('1')
      .write('\r\n--foo--')
      .end(function(res){
        res.body.should.equal('{"user":"Tobi","age":"1"}');
        done();
      });
    })
    
    it('should support nesting', function(done){
      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name][first]"\r\n')
      .write('\r\n')
      .write('tobi')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="user[name][last]"\r\n')
      .write('\r\n')
      .write('holowaychuk')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="user[age]"\r\n')
      .write('\r\n')
      .write('1')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="species"\r\n')
      .write('\r\n')
      .write('ferret')
      .write('\r\n--foo--')
      .end(function(res){
        var obj = JSON.parse(res.body);
        obj.user.age.should.equal('1');
        obj.user.name.should.eql({ first: 'tobi', last: 'holowaychuk' });
        obj.species.should.equal('ferret');
        done();
      });
    })

    it('should support multiple files of the same name', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        req.files.text.should.have.length(2);
        req.files.text[0].constructor.name.should.equal('File');
        req.files.text[1].constructor.name.should.equal('File');
        res.end();
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.statusCode.should.equal(200);
        done();
      });
    })
    
    it('should support nested files', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        Object.keys(req.files.docs).should.have.length(2);
        req.files.docs.foo.name.should.equal('foo.txt');
        req.files.docs.bar.name.should.equal('bar.txt');
        res.end();
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-Disposition: form-data; name="docs[foo]"; filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('\r\n--foo\r\n')
      .write('Content-Disposition: form-data; name="docs[bar]"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.statusCode.should.equal(200);
        done();
      });
    })
    
    it('should next(err) on multipart failure', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        res.end('whoop');
      });

      app.use(function(err, req, res, next){
        err.message.should.equal('parser error, 16 of 28 bytes parsed');
        res.statusCode = err.status;
        res.end('bad request');
      });

      app.request()
      .post('/')
      .set('Content-Type', 'multipart/form-data; boundary=foo')
      .write('--foo\r\n')
      .write('Content-filename="foo.txt"\r\n')
      .write('\r\n')
      .write('some text here')
      .write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
      .write('\r\n')
      .write('some more text stuff')
      .write('\r\n--foo--')
      .end(function(res){
        res.statusCode.should.equal(400);
        res.body.should.equal('bad request');
        done();
      });
    })

    it('should process this multipart request', function(done){
      var app, net, client, resp, http, server, processed;

      net = require("net");
      http = require("http");

      app = connect();

      app.use(connect.multipart());

      app.use(function(req, res) {
        res.end('whoop');
      });

      server = http.createServer(app);

      server.listen(0, function() {
        client = net.connect(server.address().port);
        resp = "";
        client.on('data', function (data) {
          resp += data;
        });
        client.on('end', function () {
          resp.should.match(/whoop/);
          done();
        });
        client.write(
          "POST / HTTP/1.1\r\n" +
          "Content-Length: 65\r\n" +
          "Content-Type: multipart/form-data; boundary=foo\r\n" +
          "\r\n" +
          "--foo\r\n" +
          "Content-Type: application/octet-stream\r\n" +
          "\r\n" +
          "12345\r\n" +
          "--foo--\r\n");
        client.end();
      });
    })

    it('should default req.files to {}', function(done){
      var app = connect();

      app.use(connect.multipart());

      app.use(function(req, res){
        res.end(JSON.stringify(req.files));
      });

      app.request()
      .post('/')
      .end(function(res){
        res.body.should.equal('{}');
        done();
      });
    })

  })
})
