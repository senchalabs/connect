
module.exports = require('./../../lib/connect').createServer([
    { module: {
        // No named params
        handle: function(){
            arguments[2]();
        }
    }, name: 'params' },
    { module: {
        // Does not call next AND does not respond
        handle: function(req, res, next){
            // Call foo() instead so
            // that our demo can still function.
            var foo = next;
            foo();
            
            // All good
            var ct = req.headers['content-type'];
        }
    }, name: 'hang' },
    { module: {
        handle: function(req, res, next){
            // All good
            next();
        }
    }, name: 'all good' },
    { module: {
        handle: function(req, res, next){
            // Request headers are always normalized as
            // lowercased by ryan's http parser.
            var ct = req.headers['Content-Type'];
            next();
        }
    }, name: 'req.headers' },
    { module: {
        handle: function(req, res, next){
            // req.method should be uppercase
            req.method = 'get';
            next();
        }
    }, name: 'method uppercase' },
    { filter: 'lint' }
]);