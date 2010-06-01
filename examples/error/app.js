
module.exports = [
    { filter: 'debug' },
    { module: {
        handle: function(err, req, res, next){
            throw new Error('fail');
        }
    }},
    { filter: 'error-handler', showStack: true }
];