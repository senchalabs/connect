
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
console.log('server listening on port 3000');

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
      res.end('<p>views: ' + sess.views + '</p>');
    } else {
      sess.views = 1;
      sess.cookie.expires = false;
      res.end('welcome to the session demo. refresh!');
    }
  }
).listen(3001);
console.log('server listening on port 3001');
