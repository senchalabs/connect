
/**
 * Module dependencies.
 */

var Connect = require('./../../lib/connect');

module.exports = Connect.createServer(
    Connect.staticProvider(__dirname + '/public')
);