
/*!
 * Connect
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var cookie = require('cookie');
var http = require('http');
var utils = require('./utils')
  , res = http.ServerResponse.prototype
  , setHeader = res.setHeader
  , _renderHeaders = res._renderHeaders
  , writeHead = res.writeHead;

// apply only once

if (!res._hasConnectPatch) {

  /**
   * Provide a public "header sent" flag
   * until node does.
   *
   * @return {Boolean}
   * @api public
   */

  res.__defineGetter__('headerSent', function(){
    return Boolean(this._header);
  });

  if (!('headersSent' in res)) {

    /**
     * Provide the public "header sent" flag
     * added in node.js 0.10.
     *
     * @return {Boolean}
     * @api public
     */

    res.__defineGetter__('headersSent', function(){
      return Boolean(this._header);
    });

  }

  /**
   * Set cookie `name` to `val`, with the given `options`.
   *
   * Options:
   *
   *    - `maxAge`   max-age in milliseconds, converted to `expires`
   *    - `path`     defaults to "/"
   *
   * @param {String} name
   * @param {String} val
   * @param {Object} options
   * @api public
   */

  res.cookie = function(name, val, options){
    options = utils.merge({}, options);
    if ('maxAge' in options) {
      options.expires = new Date(Date.now() + options.maxAge);
      options.maxAge /= 1000;
    }
    if (null == options.path) options.path = '/';
    this.setHeader('Set-Cookie', cookie.serialize(name, String(val), options));
  };

  /**
   * Append additional header `field` with value `val`.
   *
   * @param {String} field
   * @param {String} val
   * @api public
   */

  res.appendHeader = function appendHeader(field, val){
    var prev = this.getHeader(field);

    if (!prev) return setHeader.call(this, field, val);

    // concat the new and prev vals
    val = Array.isArray(prev) ? prev.concat(val)
      : Array.isArray(val) ? val.concat(prev)
      : [prev, val];

    return setHeader.call(this, field, val);
  };

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
    if ('set-cookie' == key) return this.appendHeader(field, val);

    // charset
    if ('content-type' == key && this.charset) {
      val += '; charset=' + this.charset;
    }

    return setHeader.call(this, field, val);
  };

  /**
   * Proxy to emit "header" event.
   */

  res._emittedHeader = false;

  res._renderHeaders = function(){
    if (!this._emittedHeader) this.emit('header');
    this._emittedHeader = true;
    return _renderHeaders.call(this);
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
