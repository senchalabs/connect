
/*!
 * Connect
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http')
  , res = http.ServerResponse.prototype
  , setHeader = res.setHeader
  , writeHead = res.writeHead;

// apply only once

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
          if (Array.isArray(prev)) {
              val = prev.concat(val);
          } else if (Array.isArray(val)) {
              val = val.concat(prev);
          } else {
              val = [prev, val];
          }
      }
    // charset
    } else if ('content-type' == key && this.charset) {
      val += '; charset=' + this.charset;
    }

    return setHeader.call(this, field, val);
  };

  res.writeHead = function(statusCode, reasonPhrase, headers){
    if (typeof reasonPhrase === 'object') headers = reasonPhrase;
    if (typeof headers === 'object') {
      Object.keys(headers).forEach(function(key){
        this.setHeader(key, headers[key]);
      }, this);
    }
    if (!this._emittedHeader) this.emit('header');
    this._emittedHeader = true;
    return writeHead.call(this, statusCode, reasonPhrase);
  };

  res._hasConnectPatch = true;
}
