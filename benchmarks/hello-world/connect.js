
/**
 * Module dependencies.
 */

var Buffer = require('buffer').Buffer,
    body = new Buffer('Hello World', 'ascii');

require('../../lib/connect').createServer([
    { module: {
        handle: function(req, res, next){
            res.writeHead(200, {
                'Content-Type': 'text/plain',
                'Content-Length': body.length
            });
            res.end(body);
        }
    }}
]).listen(3000);