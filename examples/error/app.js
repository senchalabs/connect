
module.exports = require('./../../lib/connect').createServer([
    { filter: 'debug' },
    { module: {
        handle: function(req, res, next){
            throw new Error('fail');
        }
    }},
    { filter: 'error-handler', showStack: true }
]);