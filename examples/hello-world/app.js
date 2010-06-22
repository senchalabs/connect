var Connect = require('../../lib/connect'),
    filters = Connect.filters,
    providers = Connect.providers,
    sys = require('sys');

sys.debug(sys.inspect(filters.log));

module.exports = Connect.createServer(
    filters.log(),
    function (req, res) {
        res.simpleBody(200, 'Hello World');
    }
);
