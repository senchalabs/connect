
/**
 * Module dependencies.
 */

var sys = require('sys'),
    MemoryStore = require('./../../lib/connect/filters/session/memory').MemoryStore;

module.exports = require('./../../lib/connect').createServer([
    { filter: 'body-decoder' },
    { filter: 'cookie' },
    { filter: 'session', store: new MemoryStore },
    { module: {
        handle: function(req, res, next){
            if (req.method === 'POST') {
                switch (req.body.op) {
                    case 'Update':
                        // Update session information
                        for (var key in req.body) {
                            req.session[key] = req.body[key];
                        }
                        sys.puts('Updated session');
                        break;
                    case 'Reset':
                        // Reset the session by assigning a new object
                        req.session = {};
                        sys.puts('Reset sesssion');
                        break;
                }
            }
            next();
        }
    }},
    { module: {
        handle: function(req, res, next){
            sys.puts(sys.inspect(req.session));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            // Fetch session length and display form
            req.sessionStore.length(function(err, n){
                res.end('<form method="post">'
                    + 'Name: <input type="text" name="name" value="' + (req.session.name || '') + '"/>'
                    + 'Email: <input type="text" name="email" value="' + (req.session.email || '') + '"/>'
                    + '<input type="submit" value="Update" name="op" />' 
                    + '<input type="submit" value="Reset" name="op" />' 
                    + (n === undefined ? '' : '<p>Online: ' + n + '</p>')
                    + '</form>');
            });
        }
    }}
]);