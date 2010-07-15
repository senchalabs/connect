
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var child_process = require('child_process'),
    sys = require('sys'),
    compress = require('compress');

/**
 * Provides gzip compression via the node-compress library.
 *
 * @return {Function}
 * @api public
 */

module.exports = function gzip(){
    return function gzip(req, res, next) {
        var writeHead = res.writeHead,
            write = res.write,
            end = res.end;

        res.writeHead = function (code, headers) {
            var type = headers["Content-Type"],
                accept = req.headers["accept-encoding"];

            if (!(code === 200 && accept && accept.indexOf('gzip') >= 0
                  && type && (/(text|javascript|json)/).test(type)
                  && headers["Content-Encoding"] === undefined)) {
                res.writeHead = writeHead;
                res.writeHead(code, headers);
                return;
            }

            headers["Content-Encoding"] = "gzip";
            delete headers["Content-Length"];

            var gzip = new compress.GzipStream();

            res.write = function (chunk, encoding) {
                gzip.setInputEncoding(encoding);
                gzip.write(chunk);
            };

            res.end = function (chunk, encoding) {
                if (chunk) {
                    res.write(chunk, encoding);
                }
                gzip.close();
            };

            gzip.addListener('data', function (chunk) {
                write.call(res, chunk);
            });
            gzip.addListener('error', function(err) {
                res.write = write;
                res.end = end;
                next(err);
            });
            gzip.addListener('end', function (code) {
                res.write = write;
                res.end = end;
                res.end();
            });

            res.writeHead = writeHead;
            res.writeHead(code, headers);

        };

        next();
    };
};