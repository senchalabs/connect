
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
    path = require('path'),
    url = require('url');

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
 *   - `coffeescript`   Compiles coffee to js
 *
 * @param {Object} options
 * @api public
 */

exports = module.exports = function compiler(options){
    options = options || {};

    var srcDir = process.connectEnv.compilerSrc || options.src || process.cwd(),
        destDir = process.connectEnv.compilerDest || options.dest || srcDir,
        enable = options.enable;

    if (!enable || enable.length === 0) {
        throw new Error('compiler\'s "enable" option is not set, nothing will be compiled.');
    }

    return function compiler(req, res, next){
        if (req.method !== 'GET') return next();
        var pathname = url.parse(req.url).pathname;
        for (var i = 0, len = enable.length; i < len; ++i) {
            var name = enable[i],
                compiler = compilers[name];
            if (compiler.match.test(pathname)) {
                var src = (srcDir + pathname).replace(compiler.match, compiler.ext),
                    dest = destDir + pathname;

                // Compare mtimes
                fs.stat(src, function(err, srcStats){
                    if (err) {
                        if (err.errno === process.ENOENT) {
                            next();
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
                        });
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

/**
 * Bundled compilers:
 *
 *  - [sass](http://github.com/visionmedia/sass.js) to _css_
 *  - [less](http://github.com/cloudhead/less.js) to _css_
 *  - [coffee](http://github.com/jashkenas/coffee-script) to _js_
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
    },
    coffeescript: {
      match: /\.js$/,
      ext: '.coffee',
      compile: function(str, fn){
          require.async('coffee-script', function(err, coffee){
              if (err) {
                  fn(err);
              } else {
                  try {
                      fn(null, coffee.compile(str));
                  } catch (err) {
                      fn(err);
                  }
              }
          });
      }
    }
};