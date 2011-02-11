
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
      obj[key] = decodeURIComponent(val).replace(/\+/g, ' ');
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
    , keys = Object.keys(obj);
  for (var i = 0, len = keys.length; i < len; ++i) {
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
 * Pause events on the given `obj`.
 *
 * @param {Object} obj
 * @return {Object}
 * @api public
 */

exports.pause = function(obj){
  var events = [];
  function onData(){
    events.push(['data'].concat(toArray(arguments)));
  };
  function onEnd(){
    events.push(['end'].concat(toArray(arguments)));
  };
  obj.on('data', onData);
  obj.on('end', onEnd);
  return {
    end: function(){
      obj.removeListener('data', onData);
      obj.removeListener('end', onEnd);
    },
    resume: function(){
      for (var i = 0, len = events.length; i < len; ++i) {
        obj.emit.apply(obj, events[i]);
      }
    }
  };
};

// Works like find on unix.  Does a recursive readdir and filters by pattern.
exports.find = function find(root, pattern, callback) {

    function rfind(root, callback) {
        fs.readdir(root, function (err, files) {
            if (err) {
                callback(err);
                return;
            }
            var results = [],
                counter = 0;
            files.forEach(function (file) {
                counter++;
                function checkCounter() {
                    counter--;
                    if (counter === 0) {
                        callback(null, results);
                    }
                }
                var file = root + "/" + file;
                fs.stat(file, function (err, stat) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    if (stat.isDirectory()) {
                        rfind(file, function (err, files) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            results.push.apply(results, files);
                            checkCounter();
                        });
                        checkCounter();
                        return;
                    }
                    if (pattern.test(file)) {
                        stat.path = file;
                        results.push(stat);
                    }
                    checkCounter();
                });
            });
        });
    }
    rfind(root, function (err, files) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, files.map(function (file) {
            file.path = file.path.substr(root.length);
            return file;
        }));
    });
};

/**
 * Convert array-like object to an Array.
 *
 * node-bench: "16.5 times faster than Array.prototype.slice.call()"
 *
 * @param {Object} obj
 * @return {Array}
 * @api private
 */

function toArray(obj){
  var len = obj.length
    , arr = new Array(len);
  for (var i = 0; i < len; ++i) {
    arr[i] = obj[i];
  }
  return arr;
}

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
