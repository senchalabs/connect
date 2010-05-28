/*!
 * Ext JS Connect 0.0.1
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Responds with the "X-Response-Time" header.
 */

exports.handle = function(err, req, res, next){
    var start = new Date,
        writeHead = res.writeHead;

    res.writeHead = function(code, headers){
        headers['X-Response-Time'] = ((new Date - start) / 1000).toFixed(6);
        return writeHead.call(res, code, headers);
    }

    next();
}