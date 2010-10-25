
/**
 * Module dependencies.
 */

var connect = require('./../../lib/connect');

var localhostUser = connect.vhost('*.localhost', connect.createServer(function(req, res){
    res.writeHead(302, { Location: 'http://localhost:3000/' + req.subdomains[0] });
    res.end('Moved to http://localhost:3000/' + req.subdomains[0]);
}));

var localhost = connect.vhost('localhost', connect.createServer(function(req, res){
    res.writeHead(200, {});
    res.end('local vhost ' + req.url);
}));

var dev = connect.vhost('dev', connect.createServer(function(req, res){
    res.writeHead(200, {});
    res.end('dev vhost ' + req.url);
}));

connect.createServer(
    // Shared middleware
    connect.logger(),
    // http://*.localhost:3000 will redirect to http://localhost/*
    localhostUser,
    // http://localhost:3000 server with own middleware
    localhost,
    // http://dev:3000 server with own middleware
    dev
).listen(3000);
console.log('Connect server listening on port 3000');