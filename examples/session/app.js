
/**
 * Module dependencies.
 */

var sys = require('sys'),
    MemoryStore = require('./../../lib/connect/filters/session/memory').MemoryStore;

// One minute

var minute = 60000;

module.exports = require('./../../lib/connect').createServer([
    { filter: 'log' },
    { filter: 'body-decoder' },
    { filter: 'cookie' },
    { filter: 'session', store: new MemoryStore({ reapInterval: minute, maxAge: minute * 5 }) },
    { filter: 'flash' },
    { provider: 'rest', routes: {
        get: {
            '/': function(req, res){
                res.writeHead(200, { 'Content-Type': 'text/html' });
                // Fetch number of "online" users
                req.sessionStore.length(function(err, n){
                    req.flash('info').forEach(function(msg){
                        res.write('<p>' + msg + '</p>');
                    });
                    
                    if (req.session.name) {
                        res.write('<p>Welcome ' + req.session.name + '</p>');
                    } else {
                        res.write('<form method="post">'
                            + 'Name: <input type="text" name="name" value="' + (req.session.name || '') + '"/>'
                            + '<input type="submit" value="Join" name="op" />' 
                            + '</form>');
                    }
                    if (n !== undefined) {
                        res.write('<p>Online: ' + n + '</p>');
                    }
                    res.end();
                });
            }
        },
        post: {
            '/': function(req, res){
                switch (req.body.op) {
                    case 'Join':
                        var name = req.session.name = req.body.name;
                        req.message('info', 'joined as "' + name + '"');
                        res.writeHead(303, { 'Location': '/' });
                        res.end();
                        break;
                }
            }
        }
    }}
]);