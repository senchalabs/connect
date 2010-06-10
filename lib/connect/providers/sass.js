
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
 *   - root  Public root directory, defaults to the CWD.
 */

exports.setup = function(env){
    this.root = this.root || process.cwd();
};

/**
 * Render *.sass files.
 */

exports.handle = function(req, res, next){
    if (/\.sass$/.test(req.url)) {
        var path = this.root + req.url;
        fs.readFile(path, 'utf8', function(err, str){
            if (err) {
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