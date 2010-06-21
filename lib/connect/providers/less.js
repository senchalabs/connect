
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var less = require('less'),
    Buffer = require('buffer').Buffer,
    fs = require('fs');

/**
 * Default less options:
 *
 *   - root   Public root directory, defaults to the CWD.
 *   - match  RegExp to match, defaults to /\.less$/.
 */

exports.setup = function(env){
    this.root = env.lessRoot || this.root || process.cwd();
    this.regexp = this.match || /\.less$/;
};

/**
 * Render *.less files.
 */

exports.handle = function(req, res, next){
    if (this.regexp.test(req.url)) {
        var path = this.root + req.url;
        fs.readFile(path, 'utf8', function(err, str){
            if (err) {
                next(err);
            } else {
                less.render(str, function(err, css){
                    if (err) {
                        next(err);
                    } else {
                        res.writeHead(200, {
                            'Content-Length': css.length,
                            'Content-Type': 'text/css'
                        });
                        res.end(css);
                    }
                });
            }
        });
    } else {
        next();
    }
};