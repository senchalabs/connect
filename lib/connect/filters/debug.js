
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys'),
    fs = require('fs');

/**
 * Setup debug panel.
 */

exports.setup = function(env){
    if (env.name !== 'development') {
        sys.error('Warning: "debug" middleware should never be enabled outside of the development environment');
    }
};

/**
 * Write debug panel to the given request body's <head> tag.
 */

function debug(body, req, res, js){
    var request = JSON.stringify({
        headers: req.headers,
        remoteAddress: req.remoteAddress
    });
    var response = JSON.stringify({
        headers: res.headers,
        statusCode: res.statusCode
    });
    var options = JSON.stringify(this.options);
    return body.replace('</head>',
        '<script type="text/javascript">'
        + '(function(req, res, options){ ' 
        + js + '})(' + request + ', ' + response + ', ' 
        + options + ');'
        + '</script></head>');
}

/**
 * Display debug panel.
 */
 
exports.handle = function handle(req, res, next){
    var accept = req.headers.accept || '',
        writeHead = res.writeHead,
        end = res.end,
        me = this;

    if (accept.indexOf('html') !== -1) {
        // Provide statusCode and headers to debug()
        res.writeHead = function(code, headers){
            res.statusCode = code;
            res.headers = headers;
            res.writeHead = writeHead;
            res.writeHead(code, headers);
        }
        // Inject debug.js and style.debug.css
        res.end = function(data, encoding){
            res.end = end;
            fs.readFile(__dirname + '/../public/debug.js', function(err, js){
                fs.readFile(__dirname + '/../public/style.debug.css', function(err, css){
                    res.write('<style>' + css + '</style>');
                    data = debug.call(me, data, req, res, js.toString(encoding));
                    res.end(data, encoding);
                })
            });
        }
    }
    next();
};