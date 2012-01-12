
/*!
 * Connect - multipart
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var formidable = require('formidable')
  , utils = require('../utils')
  , qs = require('qs');

/**
 * Parse multipart/form-data request bodies,
 * providing the parsed object as `req.body`
 * and `req.files`.
 *
 * TODO: revisit "error" flag, possible formidable bug
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function(options){
  options = options || {};
  return function multipart(req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};
    req.files = req.files || {};

    // ignore GET
    if ('GET' == req.method || 'HEAD' == req.method) return next();

    // check Content-Type
    if ('multipart/form-data' != utils.mime(req)) return next();

    // flag as parsed
    req._body = true;

    // parse
    var form = new formidable.IncomingForm
      , data = {}
      , files = {}
      , done;

    Object.keys(options).forEach(function(key){
      form[key] = options[key];
    });

    function ondata(name, val, data){
      if (Array.isArray(data[name])) {
        data[name].push(val);
      } else if (data[name]) {
        data[name] = [data[name], val];
      } else {
        data[name] = val;
      }
    }

    form.on('field', function(name, val){
      ondata(name, val, data);
    });

    form.on('file', function(name, val){
      ondata(name, val, files);
    });

    form.on('error', function(err){
      next(err);
      done = true;
    });

    form.on('end', function(){
      if (done) return;
      try {
        req.body = qs.parse(data);
        req.files = qs.parse(files);
        next();
      } catch (err) {
        next(err);
      }
    });

    form.parse(req);
  }
};
