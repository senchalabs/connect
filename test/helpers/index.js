
/**
 * Module dependencies.
 */

var connect = require('connect');

exports.port = require('./http').port;

exports.run = function run(){
    return connect.createServer.apply(this, arguments).listen();
}