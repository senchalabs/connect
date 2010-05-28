
require('./lib/connect').createServer([
    { module: {
        handle: function(err, req, res, next){
            throw new Error('fail');
        }
    }},
    { filter: 'error-handler', param: { dumpExceptions: true, showStack: true }}
]).listen();
