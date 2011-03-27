
/*!
 * Connect - staticProvider
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs')
  , join = require('path').join
  , utils = require('../utils')
  , Buffer = require('buffer').Buffer
  , parse = require('url').parse
  , mime = require('mime');

/**
 * Static file server with the given `root` path.
 *
 * Examples:
 *
 *     var oneDay = 86400000;
 *
 *     connect(
 *       connect.static(__dirname + '/public')
 *     ).listen(3000);
 *
 *     connect(
 *       connect.static(__dirname + '/public', { maxAge: oneDay })
 *     ).listen(3000);
 *
 * Options:
 *
 *    - `maxAge`   Browser cache maxAge in milliseconds, defaults to 0
 *
 * @param {String} root
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function static(root, options){
  options = options || {};

  // root required
  if (!root) throw new Error('static() root path required');
  options.root = root;

  return function static(req, res, next) {
    options.path = req.url;
    send(req, res, next, options);
  };
};

/**
 * Respond with 403 "Forbidden".
 *
 * @param {ServerResponse} res
 * @api private
 */

function forbidden(res) {
  var body = 'Forbidden';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.statusCode = 403;
  res.end(body);
}

/**
 * Respond with 416  "Requested Range Not Satisfiable"
 *
 * @param {ServerResponse} res
 * @api private
 */

function invalidRange(res) {
  var body = 'Requested Range Not Satisfiable';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.statusCode = 416;
  res.end(body);
}

/**
 * Attempt to tranfer the requseted file to `res`.
 *
 * @param {ServerRequest}
 * @param {ServerResponse}
 * @param {Function} next
 * @param {Object} options
 * @api private
 */

var send = exports.send = function(req, res, next, options){
  options = options || {};
  if (!options.path) throw new Error('path required');

  // setup
  var maxAge = options.maxAge || 0
    , ranges = req.headers.range
    , head = 'HEAD' == req.method
    , root = options.root
    , fn = options.callback;

  // replace next() with callback when available
  if (fn) next = fn;

  // ignore non-GET requests
  if ('GET' != req.method && !head) return next();

  // parse url
  var url = parse(options.path)
    , path = decodeURIComponent(url.pathname)
    , type;

  // potentially malicious path
  if (~path.indexOf('..')) return fn
    ? fn(new Error('Forbidden'))
    : forbidden(res);

  // join from optional root dir
  path = join(options.root, path);

  // index.html support
  if ('/' == path[path.length - 1]) path += 'index.html';

  // mime type
  type = mime.lookup(path);

  fs.stat(path, function(err, stat){
    // ignore ENOENT
    if (err) {
      if (fn) return fn(err);
      return 'ENOENT' == err.code
        ? next()
        : next(err);
    // ignore directories
    } else if (stat.isDirectory()) {
      return fn
        ? fn(new Error('Cannot Transfer Directory'))
        : next();
    }

    // we have a Range request
    if (ranges) {
      ranges = utils.parseRange(stat.size, ranges);
      // valid
      if (ranges) {
        // TODO: stream options
        // TODO: multiple support
        var stream = fs.createReadStream(path, ranges[0])
          , start = ranges[0].start
          , end = ranges[0].end;
        res.statusCode = 206;
        res.setHeader('Content-Range', 'bytes '
          + start
          + '-'
          + end
          + '/'
          + stat.size);
      // invalid
      } else {
        return fn
          ? fn(new Error('Requested Range Not Satisfiable'))
          : invalidRange(res);
      }
    // stream the entire file
    } else {
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'public, max-age=' + (maxAge / 1000));
      res.setHeader('Last-Modified', stat.mtime.toUTCString());
      res.setHeader('ETag', utils.etag(stat));

      // conditional GET support
      if (utils.conditionalGET(req)) {
        if (!utils.modified(req, res)) {
          return utils.notModified(res);
        }
      }

      // read stream
      var stream = fs.createReadStream(path);
    }

    // transfer
    var charset = mime.charsets.lookup(type);
    res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
    res.setHeader('Accept-Ranges', 'bytes');

    if (head) return res.end();
    stream.pipe(res);
    if (fn) {
      res.connection.on('error', fn);
      stream.on('end', fn);
    }
  });
};