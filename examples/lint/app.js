
module.exports = require('./../../lib/connect').createServer([
    { filter: 'lint' },
    { module: {
        handle: function(){
            // No named params
        }
    }},
    { module: {
        handle: function(req, res, next){
            // Does not call next() AND does not respond
        }
    }}
]);