
var connect = require('../')
  , should = require('./shared');

var app = connect();

app.use(connect.text({ limit: '1mb' }));

app.use(function(req, res){
  res.end(req.body);
});

describe('connect.text()', function(){
  should['limit body to']('1mb', 'text/plain', app);
  var body = 'this is the request body';

  it('should default to empty string', function(done){
    app.request()
    .post('/')
    .end(function(res){
      res.body.should.equal('');
      done();
    })
  })

  it('should support all http methods', function(done){
    app.request()
    .get('/')
    .set('Content-Type', 'text/plain')
    .set('Content-Length', body.length)
    .write(body)
    .end(function(res){
      res.body.should.equal(body);
      done();
    });
  })

  it('should assemble text/plain', function(done){
    app.request()
    .post('/')
    .set('Content-Type', 'text/plain')
    .write(body)
    .end(function(res){
      res.body.should.equal(body);
      done();
    });
  })

  it('should assemble application/json', function(done){
    var body = '{"user":"tobi"}';
    app.request()
    .post('/')
    .set('Content-Type', 'application/json')
    .write(body)
    .end(function(res){
      res.body.should.equal(body);
      done();
    });
  })

  it('should assemble application/x-www-form-urlencoded', function(done){
    var body = 'user=tobi';
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .write(body)
    .end(function(res){
      res.body.should.equal(body);
      done();
    });
  })

  it('should take other MIME types as an option', function(done){
    var app = connect();

    app.use(connect.text({mimeTypes: ['application/x-whatever']}));

    app.use(function(req, res){
      res.end(req.body);
    });
    var body = 'java.properties = baloney';
    app.request()
    .post('/')
    .set('Content-Type', 'application/x-whatever')
    .write(body)
    .end(function(res){
      res.body.should.equal(body);
      done();
    });
  })
})
