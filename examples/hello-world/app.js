// Note that even though this looks like a normal node http app, it's really a
// valid connect app using the connect middleware stack.

var Connect = require('../../lib/connect');

module.exports = Connect.createServer(
    function handle(req, res) {
        res.simpleBody(200, {method: req.method, format: req.format, body: req.body});
    }
);
