
module.exports = require('./../../lib/connect').createServer([
    { provider: 'static', root: __dirname + '/public' }
]);