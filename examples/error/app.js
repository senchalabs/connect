
/**
 * Module dependencies.
 */

var Connect = require('./../../lib/connect');

module.exports = Connect.createServer(
    function(req, res, next){
        throw new Error('oh noes!');
    },
    Connect.errorHandler({ showStack: true })
);