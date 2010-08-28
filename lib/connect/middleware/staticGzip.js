
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    parse = require('url').parse
    utils = require('../utils'),
    path = require('path');

module.exports = function staticGzip(options){
    var options = options || {},
        root = options.root,
        compress = options.compress;

    if (!root) throw new Error('staticGzip root must be set');
    if (!compress) throw new Error('staticGzip compress array must be passed');

    return function(req, res, next){
        var accept = req.headers.accept || '';

        // Must Accept: gzip
        if (!~accept.indexOf('gzip')) return next();

        // Parse the url
        var url = parse(req.url),
            filename = path.join(root, url.pathname),
            mime = utils.mime.type(filename);

        // MIME type not white-listed
        if (!~compress.indexOf(mime)) return next();

        
    }
};