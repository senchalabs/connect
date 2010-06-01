
/**
 * Module dependencies.
 */

var connect = require('connect');

require('./http')

exports.run = function run(middleware, env){
    return connect.createServer(middleware, env).listen();
}