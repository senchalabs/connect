
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    path = require('path');

var compilers = exports.compilers = {
    // Sass -> css
    sass: {
        match: /\.css$/,
        ext: '.sass',
        compile: function(str, fn){
            try {
                var css = require('sass').render(str);
            } catch (err) {
                return fn(err);
            }
            fn(null, css);
        }
    },
    
    // Less -> css
    less: {
        match: /\.css$/,
        ext: '.less',
        compile: function(str, fn){
            try {
                require('less').render(str, fn);
            } catch (err) {
                fn(err);
            }
        }
    }
};

/**
 * Default options:
 *
 *   - src      Source directory, defaults to CWD.
 *   - dest     Destination directory, defaults to src or CWD.
 *   - compile  Array of enabled compilers.
 */

exports.setup = function(env){
    this.src = env.compilerSrc || this.src || process.cwd();
    this.dest = env.compilerDest || this.dest || this.src;
    if (!this.enable || this.enable.length === 0) {
        throw new Error('compiler\'s "enable" option is not set, nothing will be compiled.');
    }
};

/**
 * Auto-compile files on request.
 */

exports.handle = function(req, res, next){
    for (var i = 0, len = this.enable.length; i < len; ++i) {
        var name = this.enable[i],
            compiler = compilers[name];
        if (compiler.match.test(req.url)) {
            var src = (this.src + req.url).replace(compiler.match, compiler.ext),
                dest = this.dest + req.url;

            // Compare mtimes
            fs.stat(src, function(err, srcStats){
                if (err) {
                    next(err);
                } else {
                    fs.stat(dest, function(err, destStats){
                        if (err) {
                            // Oh snap! it does not exist, compile it
                            if (err.errno === process.ENOENT) {
                                compile();
                            } else {
                                next(err);
                            }
                        } else {
                            // Source has changed, compile it
                            if (srcStats.mtime > destStats.mtime) {
                                compile();
                            } else {
                                // Defer file serving
                                next();
                            }
                        }
                    })
                }
            });
            
            // Compile to the destination
            function compile() {
                fs.readFile(src, 'utf8', function(err, str){
                    if (err) {
                        next(err);
                    } else {
                        compiler.compile(str, function(err, str){
                            if (err) {
                                next(err);
                            } else {
                                fs.writeFile(dest, str, 'utf8', function(err){
                                    next(err);
                                });
                            }
                        });
                    }
                });
            }
            return;
        }
    }
    next();
};