
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
module.exports = function setup(root, regexp) {
    root = root || process.cwd;
    regexp = regexp || (/\.less$/);
    
    /**
     * Render *.less files.
     */
    return function handle(req, res, next) {
        if (this.regexp.test(req.url)) {
            var path = this.root + req.url;
            fs.readFile(path, 'utf8', function(err, str){
                if (err && err.errno === process.ENOENT) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                } else if (err) {
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
    
};
