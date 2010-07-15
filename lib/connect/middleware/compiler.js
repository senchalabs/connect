
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    path = require('path');

/**
 * Bundled compilers:
 *
 *  - [sass](http://github.com/visionmedia/sass.js) to _css_
 *  - [less](http://github.com/cloudhead/less.js) to _css_
 */

var compilers = exports.compilers = {
    sass: {
        match: /\.css$/,
        ext: '.sass',
        compile: function(str, fn){
            require.async('sass', function(err, sass){
                if (err) {
                    fn(err);
                } else {
                    try {
                        fn(null, sass.render(str));
                    } catch (err) {
                        fn(err);
                    }
                }
            });
        }
    },
    less: {
        match: /\.css$/,
        ext: '.less',
        compile: function(str, fn){
            require.async('less', function(err, less){
                if (err) {
                    fn(err);
                } else {
                    try {
                        less.render(str, fn);
                    } catch (err) {
                        fn(err);
                    }
                }
            });
        }
    }
};

/**
 * Setup compiler.
 *
 * Options:
 *
 *   - `src`     Source directory, defaults to **CWD**.
 *   - `dest`    Destination directory, defaults `src`.
 *   - `enable`  Array of enabled compilers.
 *
 * Compilers:
 *
 *   - `sass`   Compiles cass to css
 *   - `less`   Compiles less to css
 *
 * @param {Object} options
 * @api public
 */

module.exports = function compiler(options){
    options = options || {};

    var srcDir = process.connectEnv.compilerSrc || options.src || process.cwd(),
        destDir = process.connectEnv.compilerDest || options.dest || srcDir,
        enable = options.enable;

    if (!enable || enable.length === 0) {
        throw new Error('compiler\'s "enable" option is not set, nothing will be compiled.');
    }

    return function compiler(req, res, next){
        for (var i = 0, len = enable.length; i < len; ++i) {
            var name = enable[i],
                compiler = compilers[name];
            if (compiler.match.test(req.url)) {
                var src = (srcDir + req.url).replace(compiler.match, compiler.ext),
                    dest = destDir + req.url;

                // Compare mtimes
                fs.stat(src, function(err, srcStats){
                    if (err) {
                        if (err.errno === process.ENOENT) {
                            res.writeHead(404, { 'Content-Type': 'text/plain' });
                            res.end('Not Found');
                        } else {
                            next(err);
                        }
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
};