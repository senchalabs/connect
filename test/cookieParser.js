
var connect = require('../');

var app = connect();

app.use(connect.cookieParser());

app.use(function(req, res, next){
  if ('/signed' != req.url) return next();
  res.end(JSON.stringify(req.signedCookies));
});

app.use(function(req, res, next){
  res.end(JSON.stringify(req.cookies));
});

describe('connect.cookieParser()', function(){
  describe('when no cookies are sent', function(){
    it('should default req.cookies to {}', function(done){
      app.request()
      .get('/')
      .expect('{}', done);
    })

    it('should default req.signedCookies to {}', function(done){
      app.request()
      .get('/')
      .expect('{}', done);
    })
  })

  describe('when cookies are sent', function(){
    it('should default req.cookies to {}', function(done){
      app.request()
      .get('/')
      .set('Cookie', 'foo=bar; bar=baz')
      .expect('{"foo":"bar","bar":"baz"}', done);
    })
  })
})