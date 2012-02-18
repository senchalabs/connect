
var connect = require('../')
  , http = require('http');

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.cookieParser('some secret'))
  .use(connect.cookieSession())
  .use(clear)
  .use(counter);

function clear(req, res, next) {
  if ('/clear' != req.url) return next();
  req.session = null;
  res.statusCode = 302;
  res.setHeader('Location', '/');
  res.end();
}

function counter(req, res) {
  req.session.count = req.session.count || 0;
  var n = req.session.count++;
  res.end('<p>hits: ' + n + '</p>'
    + '<p><a href="/clear">clear session</a></p>');
}

http.createServer(app).listen(3000);
console.log('Server listening on port 3000');