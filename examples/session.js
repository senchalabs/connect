
var connect = require('../')
  , http = require('http');

// expire sessions within a minute
// /favicon.ico is ignored, and will not 
// receive req.session

http.createServer(connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ cookie: { maxAge: 60000 }}))
  .use(connect.favicon())
  .use(function(req, res, next){
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
  })).listen(3000);

console.log('port 3000: 1 minute expiration demo');

// session cookie example
// existing as long as the browser
// session is active

http.createServer(connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ cookie: { maxAge: 5000 }}))
  .use(connect.favicon())
  .use(function(req, res, next){
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
  })).listen(3001);

console.log('port 3001: session cookies');

// $ npm install connect-redis

try {
  var RedisStore = require('connect-redis')(connect);
  http.createServer(connect()
    .use(connect.cookieParser('keyboard cat'))
    .use(connect.session({
        cookie: { maxAge: 60000 * 3 }
      , store: new RedisStore
    }))
    .use(connect.favicon())
    .use(function(req, res, next){
      var sess = req.session;
      if (sess.views) {
        sess.views++;
        res.setHeader('Content-Type', 'text/html');
        res.end('<p>views: ' + sess.views + '</p>');
      } else {
        sess.views = 1;
        res.end('welcome to the redis demo. refresh!');
      }
    })).listen(3002);
  
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

// conditional session support by simply
// wrapping middleware with middleware.

var sess = connect.session({ cookie: { maxAge: 5000 }});

http.createServer(connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(function(req, res, next){
    if ('/foo' == req.url || '/bar' == req.url) {
      sess(req, res, next);
    } else {
      next();
    }
  })
  .use(connect.favicon())
  .use(function(req, res, next){
    res.end('has session: ' + (req.session ? 'yes' : 'no'));
  })).listen(3003);

console.log('port 3003: conditional sessions');

// Session#reload() will update req.session
// without altering .maxAge or .lastAccess

// view the page several times, and see that the
// setInterval can still gain access to new
// session data

http.createServer(connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ cookie: { maxAge: 60000 }}))
  .use(connect.favicon())
  .use(function(req, res, next){
    var sess = req.session
      , prev;

    if (sess.views) {
      res.setHeader('Content-Type', 'text/html');
      res.write('<p>views: ' + sess.views + '</p>');
      res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>');
      sess.views++;
      res.end();
    } else {
      sess.views = 1;
      setInterval(function(){
        sess.reload(function(){
          console.log();
          if (prev) console.log('previous views %d, now %d', prev, req.session.views);
          console.log('time remaining until expiry: %ds', (req.session.cookie.maxAge / 1000));
          prev = req.session.views;
        });
      }, 3000);
      res.end('welcome to the session demo. refresh!');
    }
  })).listen(3004);

console.log('port 3004: Session#reload() demo');