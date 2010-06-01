
/**
 * Module dependencies.
 */

var http = require('http');

module.exports = require('http').createServer(function(req, res){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(this.env.name);
});