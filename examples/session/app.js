
/**
 * Module dependencies.
 */

var sys = require('sys'),
    MemoryStore = require('./../../lib/connect/middlewares/session/memory').MemoryStore,
    Connect = require('./../../lib/connect');

// One minute
var minute = 60000;

var Server = module.exports = Connect.createServer(
    Connect.logger(),
    Connect.bodyDecoder(),
    Connect.redirect(),
    Connect.cookieDecoder(),
    Connect.session({ store: new MemoryStore({ reapInterval: minute, maxAge: minute * 5 }) }),
    Connect.flash(),
    Connect.router(app)
);

function app(app) {
    app.get('/', function(req, res){
        res.writeHead(200, { 'Content-Type': 'text/html' });
        // Fetch number of "online" users
        req.sessionStore.length(function(err, n){
            // Display flash messages
            req.flash('info').forEach(function(msg){
                res.write('<p>' + msg + '</p>');
            });

            // User joined
            if (req.session.name) {
                res.write('<p>Welcome ' + req.session.name + '</p>');
            // User has not "joined", display the form
            } else {
                res.write('<form method="post">'
                    + 'Name: <input type="text" name="name" value="' + (req.session.name || '') + '"/>'
                    + '<input type="submit" value="Join" name="op" />'
                    + '</form>');
            }

            // Display online count
            res.write('<p>Online: ' + n + '</p>');
            res.end();
        });
    });
    app.get('/logout', function(req, res){
        req.sessionStore.regenerate(req, function(err){
            req.flash('info', 'Logged out');
            res.redirect('/');
        });
    });
    app.post('/', function(req, res){
        switch (req.body.op) {
            case 'Join':
                req.sessionStore.regenerate(req, function(err){
                    var name = req.session.name = req.body.name;
                    req.flash('info', 'joined as _"' + name + '"_ click [here](/logout) to logout.');
                    res.redirect('/');
                });
                break;
        }
    });
}