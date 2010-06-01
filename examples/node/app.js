
/**
 * Module dependencies.
 */

var Buffer = require('buffer').Buffer,
    http = require('http'),
    body = new Buffer('Hello World');

module.exports = require('http').createServer(function(req, res){
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Content-Length': body.length
    });
    res.end(body);
});