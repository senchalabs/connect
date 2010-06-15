
/**
 * Module dependencies.
 */

var sys = require('sys'),
    MemoryStore = require('./../../lib/connect/filters/session/memory').MemoryStore;

// TODO: re-generation
// TODO: clearing
// TODO: session clearing
// TODO: length

module.exports = require('./../../lib/connect').createServer([
    { filter: 'cookie' },
    { filter: 'session', store: new MemoryStore },
    { module: {
        handle: function(req, res, next){
            if (!req.session.name) {
                req.session.name = 'tj';
                sys.puts('set name');
            } else {
                sys.puts('got name ' + req.session.name);
            }
            res.writeHead(200, {});
            res.end('Wahoo');
        }
    }}
]);