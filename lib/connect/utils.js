
/*!
 * Connect - utils
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var crypto = require('crypto')
  , Path = require('path')
  , fs = require('fs');

/**
 * Return md5 hash of the given string and optional encoding,
 * defaulting to hex.
 *
 * @param {String} str
 * @param {String} encoding
 * @return {String}
 * @api public
 */

exports.md5 = function(str, encoding){
  return crypto
    .createHash('md5')
    .update(str)
    .digest(encoding || 'hex');
};

/**
 * Merge object b with object a.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */

exports.merge = function(a, b){
  if (a && b) {
    for (var key in b) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return a unique identifier with the given `len`.
 *
 * @param {Number} len
 * @return {String}
 * @api public
 */

exports.uid = function(len) {
  var buf = []
    , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    , charlen = chars.length;

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)]);
  }

  return buf.join('');
};

/**
 * Parse the given cookie string into an object.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parseCookie = function(str){
  var obj = {}
    , pairs = str.split(/[;,] */);
  for (var i = 0, len = pairs.length; i < len; ++i) {
    var pair = pairs[i]
      , eqlIndex = pair.indexOf('=')
      , key = pair.substr(0, eqlIndex).trim().toLowerCase()
      , val = pair.substr(++eqlIndex, pair.length).trim();

    // Quoted values
    if (val[0] === '"') {
      val = val.slice(1, -1);
    }

    // Only assign once
    if (obj[key] === undefined) {
      obj[key] = decodeURIComponent(val.replace(/\+/g, ' '));
    }
  }
  return obj;
};

/**
 * Serialize the given object into a cookie string.
 *
 * @param {String} name
 * @param {String} val
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.serializeCookie = function(name, val, obj){
  var pairs = [name + '=' + encodeURIComponent(val)]
    , obj = obj || {}
    , keys = Object.keys(obj)
    , len = keys.length;
  for (var i = 0; i < len; ++i) {
    var key = keys[i]
      , val = obj[key];
    if (val instanceof Date) {
      val = val.toUTCString();
    } else if (typeof val === "boolean") {
      if (true === val) pairs.push(key);
      continue;
    }
    pairs.push(key + '=' + val);
  }
  return pairs.join('; ');
};

/**
 * Pause `data` and `end` events on the given `obj`.
 *
 * @param {Object} obj
 * @return {Object}
 * @api public
 */

exports.pause = function(obj){
  var onData
    , onEnd
    , events = [];

  // buffer data
  obj.on('data', onData = function(data, encoding){
    events.push(['data', data, encoding]);
  });

  // buffer end
  obj.on('end', onEnd = function(data, encoding){
    events.push(['end', data, encoding]);
  });

  return {
    end: function(){
      obj.removeListener('data', onData);
      obj.removeListener('end', onEnd);
    },
    resume: function(){
      this.end();
      for (var i = 0, len = events.length; i < len; ++i) {
        obj.emit.apply(obj, events[i]);
      }
    }
  };
};

/**
 * Parse "Range" header `str` relative to the given file `size`.
 *
 * @param {Number} size
 * @param {String} str
 * @return {Array}
 * @api public
 */

exports.parseRange = function(size, str){
  var valid = true;
  var arr = str.substr(6).split(',').map(function(range){
    var range = range.split('-')
      , start = parseInt(range[0], 10)
      , end = parseInt(range[1], 10);

    // -500
    if (isNaN(start)) {
      start = size - end;
      end = size - 1;
    // 500-
    } else if (isNaN(end)) {
      end = size - 1;
    }

    // Invalid
    if (isNaN(start) || isNaN(end) || start > end) valid = false;

    return { start: start, end: end };
  });
  return valid ? arr : undefined;
};

/**
 * Convert array-like object to an Array.
 *
 * node-bench: "16.5 times faster than Array.prototype.slice.call()"
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

var toArray = exports.toArray = function(obj){
  var len = obj.length
    , arr = new Array(len);
  for (var i = 0; i < len; ++i) {
    arr[i] = obj[i];
  }
  return arr;
};

/**
 * Retrun a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
