
/**
 * Module dependencies.
 */

var http = require('http'),
    body = 'Hello World';

http.createServer(function(req, res){
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-Length': body.length
    });
    res.end(body);
}).listen(3000);