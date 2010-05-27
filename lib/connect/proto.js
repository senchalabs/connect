/*
Copyright (c) 2010 Tim Caswell <tim@creationix.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var proto = Object.prototype;
var func_proto = Function.prototype;
var arr_proto = Array.prototype;

// Implements a forEach much like the one for Array.prototype.forEach, but for
// any object.
if (typeof proto.forEach !== 'function') {
  Object.defineProperty(proto, "forEach", {value: function (callback, thisObject) {
    var keys = Object.keys(this);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      callback.call(thisObject, this[key], key, this);
    }
  }});
}

// Implements a map much like the one for Array.prototype.map, but for any
// object. Returns an array, not a generic object.
if (typeof proto.map !== 'function') {
  Object.defineProperty(proto, "map", {value: function (callback, thisObject) {
    var accum = [];
    var keys = Object.keys(this);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      accum[i] = callback.call(thisObject, this[key], key, this);
    }
    return accum;
  }});
}

// Implements a shallow copy onto the current object.
if (typeof proto.mixin !== 'function') {
  Object.defineProperty(proto, "mixin", {value: function (obj) {
    var keys = Object.keys(obj);
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      this[key] = obj[key];
    }
    return this;
  }});
}

// Implements a function curry function.  This allows you to call part of a
// function later.
if (typeof func_proto.curry !== 'function') {
  Object.defineProperty(func_proto, "curry", {value: function () {
    var fn = this;
    var first = arr_proto.slice.call(arguments);
    return function () {
      return fn.apply(this, first.concat(arr_proto.slice.call(arguments)));
    };
  }});
}
