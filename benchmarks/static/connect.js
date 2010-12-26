
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

connect.createServer(
    connect.staticProvider({ root: __dirname + '/../public', cache: true })
).listen(3000);