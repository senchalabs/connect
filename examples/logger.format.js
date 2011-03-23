
/**
 * Module dependencies.
 */

var connect = require('../');

// $ curl -i http://localhost:3000/

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
