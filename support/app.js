
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

var n = 9;
while (n--) {
  app.use(function(req, res, next){
    next();
  });
}

app.use(function(req, res, next){
  if ('/10' == req.url) {
    res.setHeader('Content-Length', 5);
    res.end('Hello');
  } else {
    next();
  }
});

var n = 9;
while (n--) {
  app.use(function(req, res, next){
    next();
  });
}

app.use(function(req, res, next){
  if ('/40' == req.url) {
    res.setHeader('Content-Length', 5);
    res.end('Hello');
  } else {
    next();
  }
});

app.listen(8000);