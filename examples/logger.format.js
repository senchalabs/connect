
/**
 * Module dependencies.
 */

var connect = require('../');

// $ curl http://localhost:3000/

// custom format with ansi-escape sequence colors
// format: <method> <url> <status> <response-time>ms

connect.createServer(
    connect.logger('\033[90m:method\033[0m \033[36m:url\033[0m \033[90m:status :response-timems -> :res[Content-Type]\033[0m')
  , function(req, res){
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Internal Server Error');
  }
).listen(3000);

// $ curl http://localhost:3001/
// $ curl http://localhost:3001/404
// $ curl http://localhost:3001/500

connect.createServer(
    connect.logger(function(req, res, format){
      var colors = { 404: 33, 500: 31 }
        , color = colors[res.statusCode] || 32;
      return format('\033[90m:method :url \033[0m\033[' + color + 'm:status\033[0m');
    })
  , function(req, res){
    switch (req.url) {
      case '/404': res.statusCode = 404; break;
      case '/500': res.statusCode = 500; break;
    }
    res.end('weee');
  }
).listen(3001);