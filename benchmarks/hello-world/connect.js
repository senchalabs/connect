
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect'),
    Buffer = require('buffer').Buffer,
    body = new Buffer('Hello World', 'ascii');


connect.createServer(
    function(req, res, next){
        res.writeHead(200, {
            'Content-Type': 'text/plain',
            'Content-Length': body.length
        });
        res.end(body);
    }
).listen(3000);