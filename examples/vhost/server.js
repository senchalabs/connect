
/**
 * Module dependencies.
 */

var connect = require('./../../lib/connect');

var localhost = connect.vhost('localhost', connect.createServer(function(req, res){
    res.writeHead(200, {});
    res.end('local vhost');
}));

var dev = connect.vhost('dev', connect.createServer(function(req, res){
    res.writeHead(200, {});
    res.end('dev vhost');
}));

connect.createServer(
    // Shared middleware
    connect.logger(),
    // http://localhost:3000 server with own middleware
    localhost,
    // http://dev:3000 server with own middleware
    dev
).listen(3000);
console.log('Connect server listening on port 3000');