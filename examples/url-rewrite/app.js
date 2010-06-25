
/**
 * Module dependencies.
 */

var sys = require('sys'),
    Connect = require('./../../lib/connect');

/**
 * Faux data.
 */

var data = [1,2,3,4,5];

function format(req, res, next){
    if (/\.(\w+)$/.exec(req.url)) {
        req.format = RegExp.$1;
        req.originalUrl = req.url;
        req.url = req.url.replace('.' + req.format, '');
    }
    next();
}

function respond(req, res, next){
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

module.exports = Connect.createServer(
    format,
    respond
);