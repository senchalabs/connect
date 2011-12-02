
/*!
 * Connect - bodyParser
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var multipart = require('./multipart')
  , urlencoded = require('./urlencoded')
  , json = require('./json');

/**
 * Parse request bodies.
 *
 * By default _application/json_, _application/x-www-form-urlencoded_,
 * and _multipart/form-data_ are supported, however you may map `connect.bodyParser.parse[contentType]`
 * to a function receiving `(req, options, callback)`.
 *
 * Examples:
 *
 *      connect.createServer(
 *          connect.bodyParser()
 *        , function(req, res) {
 *          res.end('viewing user ' + req.body.user.name);
 *        }
 *      );
 *
 *      $ curl -d 'user[name]=tj' http://localhost/
 *      $ curl -d '{"user":{"name":"tj"}}' -H "Content-Type: application/json" http://localhost/
 *
 * Multipart configuration:
 *
 *  The `options` passed are provided to each parser function.
 *  The _multipart/form-data_ parser merges these with formidable's
 *  IncomingForm object, allowing you to tweak the upload directory,
 *  size limits, etc. For example you may wish to retain the file extension
 *  and change the upload directory:
 *
 *     server.use(bodyParser({ uploadDir: '/www/mysite.com/uploads' }));
 *
 *  View [node-formidable](https://github.com/felixge/node-formidable) for more information.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function bodyParser(options){
  var _urlencoded = urlencoded(options)
    , _multipart = multipart(options)
    , _json = json(options);

  return function bodyParser(req, res, next) {
    _json(req, res, function(err){
      if (err) return next(err);
      _urlencoded(req, res, function(err){
        if (err) return next(err);
        _multipart(req, res, next);
      });
    });
  }
};