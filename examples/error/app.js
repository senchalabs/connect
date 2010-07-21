
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

var server = connect.createServer(
    function(req, res, next){
        throw new Error('oh noes!');
    },
    connect.errorHandler({ showStack: true, dumpExceptions: true })
);

server.listen(3000);