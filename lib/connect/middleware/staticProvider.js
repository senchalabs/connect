
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    Path = require('path'),
    utils = require('../utils'),
    Buffer = require('buffer').Buffer,
    parseUrl = require('url').parse;

/**
 * File buffer cache.
 */

var _cache = {};

/**
 * Static file server.
 *
 * Options:
 *
 *   - `root`     Root path from which to serve static files.
 *   - `maxAge`   Browser cache maxAge in milliseconds, defaults to 0
 *   - `cache`    When true cache files in memory indefinitely,
 *                until invalidated by a conditional GET request.
 *                When given, maxAge will be derived from this value.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function staticProvider(options){
    var cache, maxAge, root;

    // Support options object and root string
    if (typeof options == 'string') {
        root = options;
        maxAge = 0;
    } else {
        options = options || {};
        maxAge = options.maxAge;
        root = process.connectEnv.staticRoot || options.root || process.cwd();
        cache = options.cache;
        if (cache && !maxAge) maxAge = cache;
        maxAge = maxAge || 0;
    }

    return function staticProvider(req, res, next) {
        if (req.method != 'GET' && req.method != 'HEAD') return next();

        var hit, 
            head = req.method == 'HEAD',
            url = parseUrl(req.url),
            filename = decodeURIComponent(url.pathname);

        // Potentially malicious path
        if (~filename.indexOf('..')) {
            return forbidden(res);
        }

        // Absolute path
        filename = Path.join(root, filename);

        // Index.html support
        if (filename[filename.length - 1] === '/') {
            filename += "index.html";
        }
        
        // Cache hit
        if (cache && !conditionalGET(req) && (hit = _cache[req.url])) {
            res.writeHead(200, hit.headers);
            res.end(head ? undefined : hit.body);
            return;
        }

        fs.stat(filename, function(err, stat){

            // Pass through for missing files, thow error for other problems
            if (err) {
                return err.errno === process.ENOENT
                    ? next()
                    : next(err);
            } else if (stat.isDirectory()) {
                return next();
            }

            // Serve the file directly using buffers
            function onRead(err, data) {
                if (err) return next(err);

                // Response headers
                var headers = {
                    "Content-Type": utils.mime.type(filename),
                    "Content-Length": stat.size,
                    "Last-Modified": stat.mtime.toUTCString(),
                    "Cache-Control": "public max-age=" + (maxAge / 1000),
                    "ETag": etag(stat)
                };

                // Conditional GET
                if (!modified(req, headers)) {
                    return notModified(res, headers);
                }
                
                res.writeHead(200, headers);
                res.end(head ? undefined : data);

                // Cache support
                if (cache) {
                    _cache[req.url] = {
                        headers: headers,
                        body: data
                    };
                }
            }

            fs.readFile(filename, onRead);
        });
    };
};

/**
 * Check if `req` and response `headers`.
 *
 * @param {IncomingMessage} req
 * @param {Object} headers
 * @return {Boolean}
 * @api private
 */

function modified(req, headers) {
    var modifiedSince = req.headers['if-modified-since'],
        lastModified = headers['Last-Modified'],
        noneMatch = req.headers['if-none-match'],
        etag = headers['ETag'];

    // Check If-None-Match
    if (noneMatch && etag && noneMatch == etag) {
        return false;
    }

    // Check If-Modified-Since
    if (modifiedSince && lastModified) {
        modifiedSince = new Date(modifiedSince);
        lastModified = new Date(lastModified);
        // Ignore invalid dates
        if (!isNaN(modifiedSince.getTime())) {
            if (lastModified <= modifiedSince) return false;
        }
    }
    
    return true;
}

/**
 * Check if `req` is a conditional GET request.
 *
 * @param {IncomingMessage} req
 * @return {Boolean}
 * @api private
 */

function conditionalGET(req) {
    return req.headers['if-modified-since']
        || req.headers['if-none-match'];
}

/**
 * Return an ETag in the form of size-mtime.
 *
 * @param {Object} stat
 * @return {String}
 * @api private
 */

function etag(stat) {
    return stat.size + '-' + Number(stat.mtime);
}

/**
 * Respond with 304 "Not Modified".
 *
 * @param {ServerResponse} res
 * @param {Object} headers
 * @api private
 */

function notModified(res, headers) {
    // Strip Content-* headers
    Object.keys(headers).forEach(function(field){
        if (0 == field.indexOf('Content')) {
            delete headers[field];
        }
    });
    res.writeHead(304, headers);
    res.end();
}

/**
 * Respond with 403 "Forbidden".
 *
 * @param {ServerResponse} res
 * @api private
 */

function forbidden(res) {
    var body = 'Forbidden';
    res.writeHead(403, {
        'Content-Type': 'text/plain',
        'Content-Length': body.length
    });
    res.end(body);
}

/**
 * Clear the memory cache for `key` or the entire store.
 *
 * @param {String} key
 * @api public
 */

exports.clearCache = function(key){
    if (key) {
        delete _cache[key];
    } else {
        _cache = {};
    }
};