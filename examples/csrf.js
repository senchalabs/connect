
/**
 * Module dependencies.
 */

var connect = require('../');

var form = '\n\
  <form action="/" method="post">\n\
    <input type="hidden" name="_csrf" value="{token}" />\n\
    <input type="text" name="user[name]" value="{user}" />\n\
    <input type="password" name="user[pass]" />\n\
    <input type="submit" value="Login" />\n\
  </form>\n\
'; 

connect(
    connect.cookieParser()
  , connect.session({ secret: 'keyboard cat' })
  , connect.bodyParser()
  , connect.csrf()
  
  , function(req, res, next){
    if ('POST' != req.method) return next();
    req.session.user = req.body.user;
    next();
  }

  , function(req, res){
    res.setHeader('Content-Type', 'text/html');
    var body = form
      .replace('{token}', req.session._csrf)
      .replace('{user}', req.session.user && req.session.user.name || '');
    res.end(body);
  }
).listen(3000);
