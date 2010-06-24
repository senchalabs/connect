
/**
 * Module dependencies.
 */

var Connect = require('./../../lib/connect');

// http://localhost:3000
var localhost = Connect.vhost('localhost', Connect.createServer(function(req, res){
    res.writeHead(200, {});
    res.end('local vhost');
}));

// http://dev:3000
var dev = Connect.vhost('dev', Connect.createServer(function(req, res){
    res.writeHead(200, {});
    res.end('dev vhost');
}));

module.exports = Connect.createServer(
    // Shared middleware
    Connect.log(),
    localhost,
    dev
);