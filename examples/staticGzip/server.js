
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

var server = connect.createServer(
    connect.staticGzip({ root: __dirname, compress: ['text/css', 'text/html'] }),
    connect.staticProvider({ root: __dirname }),
    function(req, res){
        res.writeHead(200);
        res.end('GET /test.css or GET /test.html');
    }
);

server.listen(3000);
console.log('Connect server listening on port 3000');