
var connect = require('../');

var min = 60 * 1000;

function normal(req, res, next) {
  if ('/' != req.url) return next();
  res.end();
}
function changeToNull(req, res, next) {
  if ('/changeToNull' != req.url) return next();
  req.session.cookie.maxAge = null;
  res.end();
}

describe('Rolling Session', function(){

  describe('Session without Rolling.', function(){
    it('Should send the cookie just the first get. So cannot get the change to browser session', function (done) {
      var app = connect()
        .use(connect.cookieParser())
        .use(connect.session({ secret: 'keyboard cat',
                               cookie: { maxAge: min }}))
        .use(normal) 
        .use(changeToNull);

      app.request()
        .get('/')
        .end(function(res){
          res.headers.should.have.property('set-cookie');
          res.headers['set-cookie'][0].should.include('Expires');
          app.request()
            .get('/changeToNull')
            .set('Cookie', res.headers['set-cookie'][0])
            .end(function(res){
              res.headers.should.not.have.property('set-cookie');
              done();
            });
          });
    });
  });

  describe('Session with Rolling.', function(){
    it('Every get send the cookie, so can get the change to browser session', function (done) {
      var app = connect()
        .use(connect.cookieParser())
        .use(connect.session({ secret  : 'keyboard cat',
                               cookie  : { maxAge: min },
                               rolling : true}))
        .use(normal) 
        .use(changeToNull);

      app.request()
        .get('/')
        .end(function(res){
          res.headers.should.have.property('set-cookie');
          res.headers['set-cookie'][0].should.include('Expires');
          app.request()
            .get('/changeToNull')
            .set('Cookie', res.headers['set-cookie'][0])
            .end(function(res){
              res.headers.should.have.property('set-cookie');
              res.headers['set-cookie'][0].should.not.include('Expires');
              done();
            });
          });
    });
  });

});
