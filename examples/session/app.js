
/**
 * Module dependencies.
 */

var sys = require('sys'),
    MemoryStore = require('./../../lib/connect/middleware/session/memory'),
    Connect = require('./../../lib/connect');

// One minute
var minute = 60000;


var Server = module.exports = Connect.createServer(
    Connect.logger({ format: ':method :url' }),
    Connect.bodyDecoder(),
    Connect.cookieDecoder(),
    Connect.session({ store: new MemoryStore({ reapInterval: minute, maxAge: minute * 5 }) }),
    Connect.router(app),
    Connect.errorHandler({ dumpExceptions: true, showStack: true })
);

function app(app) {
    app.get('/', function(req, res){
        res.writeHead(200, { 'Content-Type': 'text/html' });
        // Fetch number of "online" users
        req.sessionStore.length(function(err, n){
            // User joined
            if (req.session.name) {
                res.write('<p>Welcome ' + req.session.name + '</p>');
            // User has not "joined", display the form
            } else {
                res.write('<form method="post">'
                    + 'Name: <input type="text" name="name"/>'
                    + '<input type="submit" value="Join" name="op" />'
                    + '</form>');
            }

            // Display online count
            res.end('<p>Online: ' + n + '</p>');
        });
    });
    app.get('/logout', function(req, res){
        req.session.regenerate(function(err){
            res.writeHead(302, { Location: '/' });
            res.end();
        });
    });
    app.post('/', function(req, res){
        switch (req.body.op) {
            case 'Join':
                req.session.regenerate(function(err){
                    var name = req.session.name = req.body.name;
                    res.writeHead(302, { Location: '/' });
                    res.end();
                });
                break;
        }
    });
}