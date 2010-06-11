
var connect = require('./../../lib/connect');

// Based on the current env name require / mixin the 
// additional file-based configuration
process.connectEnv.mixin(require('./config/' + process.connectEnv.name));

// Pass the custom environment as the second argument to createServer()
module.exports = connect.createServer([
    { filter: 'log' },
    { module: {
        handle: function(req, res, next){
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(JSON.stringify(process.connectEnv));
        }
    }}
]);