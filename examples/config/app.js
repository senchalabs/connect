
var connect = require('./../../lib/connect');

// Grab environment from parent module (bin/connect).
// run with ./bin/connect -E production start examples/config/app
var env = module.parent.exports.env;

// Based on the current env name require / mixin the 
// additional file-based configuration
env.mixin(require('./config/' + env.name));

// Pass the custom environment as the second argument to createServer()
module.exports = connect.createServer([
    { filter: 'log' },
    { module: {
        handle: function(err, req, res, next){
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(JSON.stringify(env));
        }
    }}
], env); 