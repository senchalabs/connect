/*!
 * Connect - logger
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var morgan = require('morgan');
var utils = require('../utils');

/**
 * Undeprecate default format.
 */

Object.defineProperty(morgan, 'default', {
  configurable: true,
  enumerable: true,
  value: morgan.combined
});

/**
 * Logger:
 *
 * Log requests with the given `options` or a `format` string.
 *
 * See [morgan](https://github.com/expressjs/morgan)
 *
 * @param {String|Function|Object} format or options
 * @return {Function}
 * @api public
 */

module.exports = function logger(options) {
  var opts = utils.merge({
    format: 'default'
  }, options);

  return morgan(opts.format, opts);
};
