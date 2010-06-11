
module.exports = require('./../../lib/connect').createServer([
    { filter: 'lint' },
    { module: {
        // No named params
        handle: function(){
            arguments[2]();
        }
    }},
    { module: {
        // Does not call next AND does not respond
        handle: function(req, res, next){
            
        }
    }}
]);