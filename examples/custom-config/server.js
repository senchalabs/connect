
/**
 * Module dependencies.
 */

var sys = require('sys'),
	Connect = require('./../../lib/connect');

// Based on the current env name require / mixin the 
// additional file-based configuration. Try using
// --env production 

var conf = require('./config/' + process.connectEnv.name);
for (var key in conf) {
    process.connectEnv[key] = conf[key];
}

sys.log('loading config file "config/' + process.connectEnv.name + '.js"');

module.exports = Connect.createServer(function(req, res, next){
   res.writeHead(200, { 'Content-Type': 'text/plain' });
   res.end(sys.inspect(process.connectEnv)); 
});