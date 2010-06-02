
/**
 * Module dependencies.
 */

var http = require('http'),
    fs = require('fs'),
    body = fs.readFileSync(__dirname + '/../public/jquery.js'),
    len = body.length;

http.createServer(function(req, res){
    res.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Content-Length': len
    });
    res.end(body);
}).listen(3000);