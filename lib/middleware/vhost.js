
/*!
 * Connect - vhost
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var vhost = require('vhost');

/**
 * Vhost:
 *
 * See [vhost](https://github.com/expressjs/vhost)
 *
 * @param {String} hostname
 * @param {Server} server
 * @return {Function}
 * @api public
 */

module.exports = function(hostname, server) {
  if (typeof hostname === 'string') {
    // back-compat
    hostname = new RegExp('^' + hostname.replace(/[^*\w]/g, '\\$&').replace(/[*]/g, '(?:.*?)')  + '$', 'i');
  }

  return vhost(hostname, server);
};
