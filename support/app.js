
var connect = require('..')
  , app = connect();

app.use(function(req, res, next){
  if ('/hello' == req.url) {
    res.setHeader('Content-Length', 5);
    res.end('Hello');
  } else {
    next();
  }
});

app.listen(8000);