
/*!
 * Connect
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , res = http.OutgoingMessage.prototype;

// original setHeader()

var orig = res.setHeader;

/**
 * Set header `field` to `val`, special-casing
 * the `Set-Cookie` field for multiple support.
 *
 * @param {String} field
 * @param {String} val
 * @api public
 */

res.setHeader = function(field, val){
  var field = field.toLowerCase()
    , prev;

  // special-case Set-Cookie
  if (this._headers && 'set-cookie' == field) {
    if (prev = this._headers[field]) {
      val = prev + '\r\nSet-Cookie: ' + val;
    }
  }

  return orig.call(this, field, val);
};