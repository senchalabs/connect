
var connect = require('../');

// expire sessions within a minute
// /favicon.ico is ignored, and will not 
// receive req.session

connect(
    connect.cookieParser()
  , connect.session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }})
  , connect.favicon()
  , function(req, res, next){
    var sess = req.session;
    if (sess.views) {
      res.setHeader('Content-Type', 'text/html');
      res.write('<p>views: ' + sess.views + '</p>');
      res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
      res.end();
      sess.views++;
    } else {
      sess.views = 1;
      res.end('welcome to the session demo. refresh!');
    }
  }
).listen(3000);
console.log('port 3000: 1 minute expiration demo');

// session cookie example
// existing as long as the browser
// session is active

connect(
    connect.cookieParser()
  , connect.session({ secret: 'keyboard cat', cookie: { maxAge: 5000 }})
  , connect.favicon()
  , function(req, res, next){
    var sess = req.session;
    if (sess.views) {
      sess.views++;
      res.setHeader('Content-Type', 'text/html');
      res.end('<p>views: ' + sess.views + '</p>');
    } else {
      sess.views = 1;
      sess.cookie.expires = false;
      res.end('welcome to the session demo. refresh!');
    }
  }
).listen(3001);
console.log('port 3001: session cookies');

// $ npm install connect-redis

try {
  var RedisStore = require('connect-redis');
  connect(
      connect.cookieParser()
    , connect.session({
        secret: 'keyboard cat'
      , cookie: { maxAge: 60000 * 3 }
      , store: new RedisStore
    })
    , connect.favicon()
    , function(req, res, next){
      var sess = req.session;
      if (sess.views) {
        sess.views++;
        res.setHeader('Content-Type', 'text/html');
        res.end('<p>views: ' + sess.views + '</p>');
      } else {
        sess.views = 1;
        res.end('welcome to the redis demo. refresh!');
      }
    }
  ).listen(3002);
  console.log('port 3002: redis example');
} catch (err) {
  console.log('\033[33m');
  console.log('failed to start the Redis example.');
  console.log('to try it install redis, start redis');
  console.log('install connect-redis, and run this');
  console.log('script again.');
  console.log('    $ redis-server');
  console.log('    $ npm install connect-redis');
  console.log('\033[0m');
}
