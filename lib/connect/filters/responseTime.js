/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Responds with the "X-Response-Time" header.
 */
module.exports = function setup() {
    return function handle(req, res, next) {
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