
var connect = require('./')
  , http = require('http');

var app = connect();

function subdomains(req, res, next){
  req.subdomains = req.headers.host
    .split('.')
    .slice(0, -2)
    .reverse();

  next();
}

app.use(subdomains);
app.use(function(req, res, next){
  console.log(req.subdomains);
});

http.createServer(app).listen(3000);