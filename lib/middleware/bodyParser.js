
/*!
 * Connect - bodyParser
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var qs = require('qs')
  , formidable = require('formidable');

/**
 * Extract the mime type from the given request's
 * _Content-Type_ header.
 *
 * @param  {IncomingMessage} req
 * @return {String}
 * @api private
 */

function mime(req) {
  var str = req.headers['content-type'] || '';
  return str.split(';')[0];
}

/**
 * Parse request bodies.
 *
 * By default _application/json_ and _application/x-www-form-urlencoded_
 * are supported, however you may map `connect.bodyParser.parse[contentType]`
 * to a function of your choice to replace existing parsers, or implement
 * one for other content-types.
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
 * Since both _json_ and _x-www-form-urlencoded_ are supported by
 * default, either of the following requests would result in the response
 * of "viewing user tj".
 *
 *      $ curl -d 'user[name]=tj' http://localhost/
 *      $ curl -d '{"user":{"name":"tj"}}' -H "Content-Type: application/json" http://localhost/
 *
 * @return {Function}
 * @api public
 */

exports = module.exports = function bodyParser(){
  return function bodyParser(req, res, next) {
    if (req.body) return next();
    req.body = {};

    if ('GET' == req.method || 'HEAD' == req.method) return next();
    var parser = exports.parse[mime(req)];
    if (parser) {
      parser(req, next);
    } else {
      next();
    }
  }
};

/**
 * Parsers.
 */

exports.parse = {};

/**
 * Parse application/x-www-form-urlencoded.
 */

exports.parse['application/x-www-form-urlencoded'] = function(req, fn){
  var buf = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk){ buf += chunk });
  req.on('end', function(){
    try {
      req.body = qs.parse(buf);
      fn();
    } catch (err){
      fn(err);
    }
  });
};

/**
 * Parse application/json.
 */

exports.parse['application/json'] = function(req, fn){
  var buf = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk){ buf += chunk });
  req.on('end', function(){
    try {
      req.body = JSON.parse(buf);
      fn();
    } catch (err){
      fn(err);
    }
  });
};

/**
 * Parse multipart/form-data.
 */

exports.parse['multipart/form-data'] = function(req, fn){
  var form = new formidable.IncomingForm
    , query = []
    , files = {};

  form.on('field', function(name, val){
    query.push(name + '=' + val);
  });

  form.on('file', function(){
    console.log(arguments);
  });

  form.on('error', fn);

  form.on('end', function(){
    query = query.join('&');
    query = qs.parse(query);
    req.body = query;
    fn();
  });

  form.parse(req);
};