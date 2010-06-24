
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

connect.createServer(
    connect.staticProvider(__dirname + '/../public')
).listen(3000);