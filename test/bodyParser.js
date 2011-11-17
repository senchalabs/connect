
var connect = require('../');

var app = connect();

app.use(connect.bodyParser());

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

describe('connect.bodyParser()', function(){
  it('should default to {}', function(done){
    app.request()
    .post('/')
    .end(function(res){
      res.body.should.equal('{}');
      done();
    })
  })

  it('should parse JSON', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/json')
    .write('{"user":"tobi"}')
    .end(function(res){
      res.body.should.equal('{"user":"tobi"}');
      done();
    });
  })
  
  it('should parse x-www-form-urlencoded', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write('user=tobi')
    .end(function(res){
      res.body.should.equal('{"user":"tobi"}');
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

      app.use(connect.bodyParser());

      app.use(function(req, res){
        req.body.user.should.eql({ name: 'Tobi' });
        req.body.text.path.should.not.include.string('.txt');
        req.body.text.constructor.name.should.equal('File');
        res.end(req.body.text.name);
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

      app.use(connect.bodyParser({
        keepExtensions: true
      }));

      app.use(function(req, res){
        req.body.user.should.eql({ name: 'Tobi' });
        req.body.text.path.should.include.string('.txt');
        req.body.text.constructor.name.should.equal('File');
        res.end(req.body.text.name);
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
      .write('Content-Disposition: form-data; name="user[name]"\r\n')
      .write('\r\n')
      .write('tobi')
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
        res.body.should.equal('{"user":{"name":"tobi","age":"1"},"species":"ferret"}');
        done();
      });
    })

    it('should support multiple files of the same name', function(done){
      var app = connect();

      app.use(connect.bodyParser());

      app.use(function(req, res){
        req.body.text.should.have.length(2);
        req.body.text[0].constructor.name.should.equal('File');
        req.body.text[1].constructor.name.should.equal('File');
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

  })
})