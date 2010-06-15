
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
    { filter: 'body-decoder' },
    { filter: 'cookie' },
    { filter: 'session' },
    { module: {
        handle: function(req, res, next){
            if (req.method === 'POST') {
                for (var key in req.body) {
                    req.session[key] = req.body[key];
                }
                sys.puts('Updated name to ' + req.session.name);
            }
            next();
        }
    }},
    { module: {
        handle: function(req, res, next){
            sys.puts(sys.inspect(req.session));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            req.sessionStore.length(function(err, n){
                res.end('<form method="post">'
                    + 'Name: <input type="text" name="name" value="' + (req.session.name || '') + '"/>'
                    + 'Email: <input type="text" name="email" value="' + (req.session.email || '') + '"/>'
                    + '<input type="submit" value="Change"/>' 
                    + '<p>Online: ' + n + '</p>' 
                    + '</form>');
            });
        }
    }}
]);