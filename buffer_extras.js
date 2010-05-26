/*
Copyright (c) 2010 Tim Caswell <tim@extjs.com>

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

var Buffer = module.exports = require('buffer').Buffer;
var proto = Buffer.prototype;

// Cleans the buffer to be all zeroes
proto.zeroOut = function zeroOut() {
  for (var i = 0, l = this.length; i < l; i++) {
    this[i] = 0;
  }
};

// Writes a 32 bit integer at offset
proto.int32Write = function int32Write(number, offset) {
  offset = offset || 0;
  var unsigned = (number < 0) ? (number + 0x100000000) : number;
  this[offset] = Math.floor(unsigned / 0xffffff);
  unsigned &= 0xffffff;
  this[offset + 1] = Math.floor(unsigned / 0xffff);
  unsigned &= 0xffff;
  this[offset + 2] = Math.floor(unsigned / 0xff);
  unsigned &= 0xff;
  this[offset + 3] = Math.floor(unsigned);
};

// Writes a 16 bit integer at offset
proto.int16Write = function int16Write(number, offset) {
  offset = offset || 0;
  var unsigned = (number < 0) ? (number + 0x10000) : number;
  this[offset] = Math.floor(unsigned / 0xff);
  unsigned &= 0xff;
  this[offset + 1] = Math.floor(unsigned);
}

// Reads a 32 bit integer from offset
proto.int32Read = function int32Read(offset) {
  offset = offset || 0;
  var unsigned = this[offset] * 0x1000000 + 
                 this[offset + 1] * 0x10000 + 
                 this[offset + 2] * 0x100 +
                 this[offset + 3];
  return (unsigned & 0x80000000) ? (unsigned - 0x100000000) : unsigned
};

// Reads a 32 bit integer from offset
proto.int16Read = function int16Read(offset) {
  offset = offset || 0;
  var unsigned = this[offset] * 0x100 + 
                 this[offset + 1];
  return (unsigned & 0x8000) ? (unsigned - 0x10000) : unsigned
};

Buffer.fromString = function fromString(string) {
  var b = new Buffer(Buffer.byteLength(string));
  b.write(string, 'utf8');
  return b;
}

Buffer.makeWriter = function makeWriter() {
  var data = [];
  var writer;
  var push = {
    int32: function pushInt32(number) {
      var b = new Buffer(4);
      b.int32Write(number);
      data.push(b);
      return writer;
    },
    int16: function pushInt16(number) {
      var b = new Buffer(2);
      b.int16Write(number);
      data.push(b);
      return writer;
    },
    string: function pushString(string) {
      data.push(Buffer.fromString(string));
      return writer;
    },
    cstring: function pushCstring(string) {
      data.push(Buffer.fromString(string + "\0"));
      return writer;
    },
    multicstring: function pushMulticstring(fields) {
      data.push(Buffer.fromString(fields.join("\0") + "\0\0"));
      return writer;
    },
    hash: function pushHash(hash) {
      var keys = Object.keys(hash);
      var pairs = [];
      for (var i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        pairs.push(key + "\0" + hash[key] + "\0");
      }
      data.push(Buffer.fromString(pairs.join("") + "\0"));
      return writer;
    }
  };
  writer = {
    data: data,
    push: push,
    
    // Convert an array of buffers into a single buffer using memcopy
    toBuffer: function toBuffer() {
      var total = 0;
      var i, l = data.length;
      for (i = 0; i < l; i++) {
        total += data[i].length;
      }
      var b = new Buffer(total);
      var offset = 0;
      for (i = 0; i < l; i++) {
        data[i].copy(b, offset);
        offset += data[i].length;
      }
      return b;
    }
  };
  return writer;
}

proto.toReader = function toReader() {
  var offset = 0, length = this.length, buffer = this;
  return {
    empty: function empty() {
      return offset >= length;
    },
    int32: function shiftInt32() {
      var number = buffer.int32Read(offset);
      offset += 4;
      return number;
    },
    int16: function shiftInt16() {
      var number = buffer.int16Read(offset);
      offset += 2;
      return number;
    },
    buffer: function shiftBuffer(length) {
      var b = buffer.slice(offset, offset + length);
      offset += length;
      return b;
    },
    string: function shiftString(length) {
      var string = buffer.toString('utf8', offset, offset + length);
      offset += length;
      return string;
    },
    cstring: function shiftCstring() {
      var end = offset;
      while (buffer[end] > 0 && end < length) { end++; }
      var string = buffer.toString('utf8', offset, end);
      offset = end + 1;
      return string;
    },
    multicstring: function shiftMulticstring() {
      var fields = [];
      while (buffer[offset] > 0) {
        fields.push(this.cstring());
      }
      offset++;
      return fields;
    },
    hash: function shiftHash() {
      var hash = {};
      while (buffer[offset] > 0) {
        hash[this.cstring()] = this.cstring();
      }
      offset++;
      return hash;
    }
  }
};

// Test It
// var sys = require('sys');
// 
// var w = Buffer.makeWriter();
// w.push.int32(305419896);
// w.push.int16(4660);
// w.push.string("12345");
// w.push.cstring("Héllø Wø®l∂");
// w.push.multicstring(["Hello", "World"]);
// w.push.hash({name: "Tim", age: "28"});
// w.push.int32(0x12345678);
// w.push.int16(0x1234);
// var b = w.toBuffer();
// // sys.p(b);
// var r = b.toReader();
// sys.p([
//   r.int32(),
//   r.int16(),
//   r.string(5),
//   r.cstring(),
//   r.multicstring(),
//   r.hash(),
//   r.int32(),
//   r.int16()
// ]);
// 
