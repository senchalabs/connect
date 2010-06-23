var Connect = require('../../lib/connect');

var Server = module.exports = Connect.createServer(
    Connect.logFilter(),
    Connect.staticProvider(__dirname),
    function (req, res) {
        res.simpleBody(200, 'Hello World');
    }
);
