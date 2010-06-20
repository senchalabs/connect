
/**
 * Module dependencies.
 */

var connect = require('connect');

exports.port = require('./http').port;

exports.run = function run(middleware, env){
    return connect.createServer(middleware, env).listen();
}