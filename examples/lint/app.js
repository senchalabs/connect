
/**
 * Module dependencies.
 */

var connect = require('../../lib/connect');

var server = connect.createServer(
    // No named params
    function params(){
        arguments[2]();
    },
    // Does not call next AND does not respond
    function hang(req, res, next){
        // Call foo() instead so
        // that our demo can still function.
        var foo = next;
        foo();

        // All good
        var ct = req.headers['content-type'];
    },
    function allGood(req, res, next){
        // All good
        next();
    },
    function reqHeaders(req, res, next){
        // Request headers are always normalized as
        // lowercased by ryan's http parser.
        var ct = req.headers['Content-Type'];
        next();
    },
    function methodUppercase(req, res, next){
        // req.method should be uppercase
        req.method = 'get';
        next();
    }
);

server.use('/', connect.lint(server));
server.listen(3000);
console.log('Connect server listening on port 3000');