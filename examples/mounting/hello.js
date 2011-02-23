
/**
 * Module dependencies.
 */

var Connect = require('./../../lib/connect');

var Server = module.exports = Connect.createServer();

Server.use('/hello', function(req, res){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello');
});