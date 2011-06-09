
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

var setHeader = res.setHeader;


if (!res._hasConnectPatch) {

  /**
   * Set header `field` to `val`, special-casing
   * the `Set-Cookie` field for multiple support.
   *
   * @param {String} field
   * @param {String} val
   * @api public
   */

  res.setHeader = function(field, val){
    var key = field.toLowerCase()
      , prev;

    // special-case Set-Cookie
    if (this._headers && 'set-cookie' == key) {
      if (prev = this.getHeader(field)) {
        val = Array.isArray(prev)
          ? prev.concat(val)
          : [prev, val];
      }
    // charset
    } else if ('content-type' == key && this.charset) {
      val += '; charset=' + this.charset;
    }

    return setHeader.call(this, field, val);
  };

  res._hasConnectPatch = true;
}
