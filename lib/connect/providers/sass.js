
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sass = require('sass'),
    Buffer = require('buffer').Buffer,
    fs = require('fs');

/**
 * Default sass options:
 *
 *   - root   Public root directory, defaults to the CWD.
 *   - match  RegExp to match, defaults to /\.sass$/.
 */

exports.setup = function(env){
    this.root = env.sassRoot || this.root || process.cwd();
    this.regexp = this.match || /\.sass$/;
};

/**
 * Render *.sass files.
 */

exports.handle = function(req, res, next){
    if (this.regexp.test(req.url)) {
        var path = this.root + req.url;
        fs.readFile(path, 'utf8', function(err, str){
            if (err && err.errno === process.ENOENT) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
            } else if (err) {
                next(err);
            } else {
                var css = sass.render(str);
                res.writeHead(200, {
                    'Content-Length': css.length,
                    'Content-Type': 'text/css'
                });
                res.end(css);
            }
        });
    } else {
        next();
    }
};