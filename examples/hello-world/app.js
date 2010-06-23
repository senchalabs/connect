var Connect = require('../../lib/connect');

module.exports = Connect.createServer(
    Connect.responseTime(),
    Connect.logger(),
    Connect.conditionalGet(),
    Connect.cache(1),
    Connect.gzip(),
    Connect.bodyDecoder(),
    Connect.cookieDecoder(),
    Connect.debug(),
    Connect.methodOverride(),
    Connect.staticProvider(__dirname),
    Connect.format(),
    function handle(req, res) {
        res.simpleBody(200, {method: req.method, format: req.format, body: req.body});
    }
);

// Tested:
"bodyDecoder"
"cache"
"conditionalGet"

// Skipped
"cookie"
"debug"