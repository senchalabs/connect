
/*!
 * Connect - errorHandler
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils')
  , url = require('url')
    fs = require('fs');

/**
 * Setup error handler with the given `options`.
 *
 * Options:
 *
 *   - `showStack`, `stack` respond with both the error message and stack trace. Defaults to `false`
 *   - `showMessage`, `message`, respond with the exception message only. Defaults to `false`
 *   - `dumpExceptions`, `dump`, dump exceptions to stderr (without terminating the process). Defaults to `false`
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function errorHandler(options){
  options = options || {};

  // defaults
  var showStack = options.showStack || options.stack
    , showMessage = options.showMessage || options.message
    , dumpExceptions = options.dumpExceptions || options.dump
    , formatUrl = options.formatUrl;

  // wrap li
  function li(v){ return '<li>' + v + '</li>'; }

  return function errorHandler(err, req, res, next){
    if (dumpExceptions) console.error(err.stack);
    if (showStack) {
      var accept = req.headers.accept || '';
      if (accept.indexOf('html') !== -1) {
        fs.readFile(__dirname + '/../public/style.css', function(e, style){
          style = style.toString('ascii');
          fs.readFile(__dirname + '/../public/error.html', function(e, html){
            var stack = err.stack
              .split('\n').slice(1)
              .map(li).join('');
              html = html
                .toString('utf8')
                .replace('{style}', style)
                .replace('{stack}', stack)
                .replace(/\{error\}/g, err.toString());
              res.writeHead(500, { 'Content-Type': 'text/html' });
              res.end(html);
          });
        });
      } else if (accept.indexOf('json') !== -1) {
        var json = JSON.stringify({ error: err });
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(json);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(err.stack);
      }
    } else {
      var body = showMessage
        ? err.toString()
        : 'Internal Server Error';
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(body);
    }
  };
};
