
/*!
 * Connect - query
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2011 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var qs = require('qs')
  , parse = require('url').parse;

/**
 * Query:
 *
 * Automatically parse the query-string when available,
 * populating the `req.query` object.
 *
 * Examples:
 *
 *     connect()
 *       .use(connect.query())
 *       .use(function(req, res){
 *         res.end(JSON.stringify(req.query));
 *       });
 *
 * @return {Function}
 * @api public
 */

module.exports = function query(){
  return function query(req, res, next){
    req.query = ~req.url.indexOf('?')
      ? qs.parse(parse(req.url).query)
      : {};
    next();
  };
};
