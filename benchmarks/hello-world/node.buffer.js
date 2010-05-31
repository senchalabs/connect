
/**
 * Module dependencies.
 */

var http = require('http'),
    Buffer = require('buffer').Buffer,
    body = new Buffer('Hello World', 'ascii');

http.createServer(function(req, res){
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-Length': body.length
    });
    res.end(body);
}).listen(3000);