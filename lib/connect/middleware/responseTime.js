
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Responds with the _X-Response-Time_ header in milliseconds.
 *
 * @return {Function}
 * @api public
 */

module.exports = function responseTime(){
    return function responseTime(req, res, next){
        var start = new Date,
            writeHead = res.writeHead;

        res.writeHead = function(code, headers){
            res.writeHead = writeHead;
            headers['X-Response-Time'] = (new Date - start) + "ms";
            res.writeHead(code, headers);
        };

        next();
    };
};