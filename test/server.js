
var connect = require('../');

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

    app.request()
    .get('http://example.com/foo')
    .expect('http://example.com/foo', done);
  })

  it('should allow old-style constructor middleware', function(){
    var app = connect(
        connect.json()
      , connect.multipart()
      , connect.urlencoded());

    app.stack.should.have.length(3);
  })

  it('should allow old-style .createServer()', function(){
    var app = connect.createServer(
        connect.json()
      , connect.multipart()
      , connect.urlencoded());

    app.stack.should.have.length(3);
  })

  it('should escape the 404 response body', function(done){
    var app = connect();
    app.request()
    .get('/foo/<script>stuff</script>')
    .expect('Cannot GET /foo/&lt;script&gt;stuff&lt;/script&gt;', done);
  })
})
