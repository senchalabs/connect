
/**
 * Module dependencies.
 */

var Connect = require('./../../lib/connect');

var localhost = Connect.vhost('localhost', Connect.createServer(function(req, res){
    res.writeHead(200, {});
    res.end('local vhost');
}));

var dev = Connect.vhost('dev', Connect.createServer(function(req, res){
    res.writeHead(200, {});
    res.end('dev vhost');
}));

module.exports = Connect.createServer(
    // Shared middleware
    Connect.logger(),
    // http://localhost:3000 server with own middleware
    localhost,
    // http://dev:3000 server with own middleware
    dev
);