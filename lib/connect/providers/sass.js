
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
 */

exports.setup = function(env){
    this.root = env.sassRoot || this.root || process.cwd();
};

/**
 * Compile *.css from *.sass files of the same name.
 */

exports.handle = function(req, res, next){
    if (/\.css$/.test(req.url)) {
        var cssPath = this.root + req.url,
            sassPath = cssPath.replace(/css$/, 'sass');
        
        // Compare mtimes
        fs.stat(sassPath, function(err, sassStats){
            if (err) {
                next(err);
            } else {
                fs.stat(cssPath, function(err, cssStats){
                    if (err) {
                        // Oh snap! it does not exist, compile it
                        if (err.errno === process.ENOENT) {
                            compile();
                        } else {
                            next(err);
                        }
                    } else {
                        // Sass has been updated, compile it
                        if (sassStats.mtime > cssStats.mtime) {
                            compile();
                        } else {
                            // let static middleware serve the file
                            next();
                        }
                    }
                })
            }
        });
        
        // Compile and serve
        function compile() {
            fs.readFile(sassPath, 'utf8', function(err, str){
                if (err) {
                    if (err.errno === process.ENOENT) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Not Found');
                    } else {
                        next(err);
                    }
                } else {
                    // Attempt rendering the sass
                    try {
                        var css = sass.render(str);
                    } catch (err) {
                        next(err);
                    }
                    
                    // Write out the css
                    fs.writeFile(cssPath, css, 'utf8', function(err){
                        next(err);
                    });
                }
            });
        }
    } else {
        next();
    }
};