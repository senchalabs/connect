
/**
 * Module dependencies.
 */

var sys = require('sys');

/**
 * Faux data.
 */

var data = [1,2,3,4,5];

var format = {
    handle: function(req, res, next){
        if (/\.(\w+)$/.exec(req.url)) {
            req.format = RegExp.$1;
            req.originalUrl = req.url;
            req.url = req.url.replace('.' + req.format, '');
        }
        next();
    }
};

module.exports = require('./../../lib/connect').createServer([
    { module: format },
    { module: {
        handle: function(req, res){
            var body = (function(){
                switch (req.format) {
                    case 'json':
                        return JSON.stringify(data);
                    case 'xml':
                        return '<items>' + data.map(function(n){
                            return '<item>' + n + '</item>'
                        }) + '</items>';
                    default:
                        return data.join();
                }
            })();
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(body);
        }
    }}
]);