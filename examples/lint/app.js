
module.exports = require('./../../lib/connect').createServer([
    { module: {
        // No named params
        handle: function(){
            arguments[2]();
        }
    }},
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
    }},
    { module: {
        handle: function(req, res, next){
            // Request headers are always normalized as
            // lowercased by ryan's http parser.
            var ct = req.headers['Content-Type'];
            next();
        }
    }},
    { filter: 'lint' }
]);