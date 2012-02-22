/*!
 * Should
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var util = require('util')
  , http = require('http')
  , assert = require('assert')
  , AssertionError = assert.AssertionError
  , statusCodes = http.STATUS_CODES
  , eql = require('./eql')
  , i = util.inspect;

/**
 * Expose assert as should.
 * 
 * This allows you to do things like below
 * without require()ing the assert module.
 *
 *    should.equal(foo.bar, undefined);
 *
 */

exports = module.exports = assert;

/**
 * Library version.
 */

exports.version = '0.4.2';

/**
 * Assert _obj_ exists, with optional message.
 *
 * @param {Mixed} obj
 * @param {String} msg
 * @api public
 */
 
exports.exist = function(obj, msg){
  if (null == obj) {
    throw new AssertionError({
        message: msg || ('expected ' + i(obj) + ' to exist')
      , stackStartFunction: should.exist
    });
  }
};

/**
 * Asserts _obj_ does not exist, with optional message.
 *
 * @param {Mixed} obj
 * @param {String} msg
 * @api public
 */

exports.not = {};
exports.not.exist = function(obj, msg){
  if (null != obj) {
    throw new AssertionError({
        message: msg || ('expected ' + i(obj) + ' to not exist')
      , stackStartFunction: should.not.exist
    });
  }
};

/**
 * Expose api via `Object#should`.
 *
 * @api public
 */

Object.defineProperty(Object.prototype, 'should', {
  set: function(){},
  get: function(){
    return new Assertion(this);
  },
  configurable: true
});

/**
 * Initialize a new `Assertion` with the given _obj_.
 *
 * @param {Mixed} obj
 * @api private
 */

var Assertion = exports.Assertion = function Assertion(obj) {
  this.obj = obj;
};

/**
 * Prototype.
 */

Assertion.prototype = {

  /**
   * HACK: prevents double require() from failing.
   */
  
  exports: exports,

  /**
   * Assert _expr_ with the given _msg_ and _negatedMsg_.
   *
   * @param {Boolean} expr
   * @param {String} msg
   * @param {String} negatedMsg
   * @api private
   */

  assert: function(expr, msg, negatedMsg){
    var msg = this.negate ? negatedMsg : msg
      , ok = this.negate ? !expr : expr;
    if (!ok) {
      throw new AssertionError({
          message: msg
        , stackStartFunction: this.assert
      });
    }
  },

  /**
   * Dummy getter.
   *
   * @api public
   */
  
  get an() {
    return this;
  },
  
  /**
   * Dummy getter.
   *
   * @api public
   */
  
  get and() {
    return this;
  },
  
  /**
   * Dummy getter.
   *
   * @api public
   */
  
  get be() {
    return this;
  },

  /**
   * Dummy getter.
   *
   * @api public
   */
  
  get have() {
    return this;
  },
  
  /**
   * Dummy getter.
   *
   * @api public
   */
  
  get with() {
    return this;
  },
  
  /**
   * Negation modifier.
   *
   * @api public
   */
  
  get not() {
    this.negate = true;
    return this;
  },
  
  /**
   * Get object inspection string.
   *
   * @return {String}
   * @api private
   */
  
  get inspect() {
    return i(this.obj);
  },

  /**
   * Assert instanceof `Arguments`.
   *
   * @api public
   */

  get arguments() {
    this.assert(
        '[object Arguments]' == Object.prototype.toString.call(this.obj)
      , 'expected ' + this.inspect + ' to be arguments'
      , 'expected ' + this.inspect + ' to not be arguments');
    return this;
  },

  /**
   * Assert that an object is empty aka length of 0.
   *
   * @api public
   */
  
  get empty() {
    this.obj.should.have.property('length');
    this.assert(
        0 === this.obj.length
      , 'expected ' + this.inspect + ' to be empty'
      , 'expected ' + this.inspect + ' not to be empty');
    return this;
  },

  /**
   * Assert ok.
   *
   * @api public
   */
  
  get ok() {
    this.assert(
        this.obj
      , 'expected ' + this.inspect + ' to be truthy'
      , 'expected ' + this.inspect + ' to be falsey');
    return this;
  },
  
  /**
   * Assert true.
   *
   * @api public
   */
  
  get true() {
    this.assert(
        true === this.obj
      , 'expected ' + this.inspect + ' to be true'
      , 'expected ' + this.inspect + ' not to be true');
    return this;
  },
  
  /**
   * Assert false.
   *
   * @api public
   */
  
  get false() {
    this.assert(
        false === this.obj
      , 'expected ' + this.inspect + ' to be false'
      , 'expected ' + this.inspect + ' not to be false');
    return this;
  },
  
  /**
   * Assert equal. 
   *
   * @param {Mixed} val
   * @api public
   */
  
  eql: function(val){
    this.assert(
        eql(val, this.obj)
      , 'expected ' + this.inspect + ' to equal ' + i(val)
      , 'expected ' + this.inspect + ' to not equal ' + i(val));
    return this;
  },
  
  /**
   * Assert strict equal. 
   *
   * @param {Mixed} val
   * @api public
   */
  
  equal: function(val){
    this.assert(
        val === this.obj
      , 'expected ' + this.inspect + ' to equal ' + i(val)
      , 'expected ' + this.inspect + ' to not equal ' + i(val));
    return this;
  },
  
  /**
   * Assert within start to finish (inclusive). 
   *
   * @param {Number} start
   * @param {Number} finish
   * @api public
   */
  
  within: function(start, finish){
    var range = start + '..' + finish;
    this.assert(
        this.obj >= start && this.obj <= finish
      , 'expected ' + this.inspect + ' to be within ' + range
      , 'expected ' + this.inspect + ' to not be within ' + range);
    return this;
  },
  
  /**
   * Assert typeof. 
   *
   * @api public
   */
  
  a: function(type){
    this.assert(
        type == typeof this.obj
      , 'expected ' + this.inspect + ' to be a ' + type
      , 'expected ' + this.inspect + ' not to be a ' + type);
    return this;
  },
  
  /**
   * Assert instanceof. 
   *
   * @api public
   */
  
  instanceof: function(constructor){
    var name = constructor.name;
    this.assert(
        this.obj instanceof constructor
      , 'expected ' + this.inspect + ' to be an instance of ' + name
      , 'expected ' + this.inspect + ' not to be an instance of ' + name);
    return this;
  },

  /**
   * Assert numeric value above _n_.
   *
   * @param {Number} n
   * @api public
   */
  
  above: function(n){
    this.assert(
        this.obj > n
      , 'expected ' + this.inspect + ' to be above ' + n
      , 'expected ' + this.inspect + ' to be below ' + n);
    return this;
  },
  
  /**
   * Assert numeric value below _n_.
   *
   * @param {Number} n
   * @api public
   */
  
  below: function(n){
    this.assert(
        this.obj < n
      , 'expected ' + this.inspect + ' to be below ' + n
      , 'expected ' + this.inspect + ' to be above ' + n);
    return this;
  },
  
  /**
   * Assert string value matches _regexp_.
   *
   * @param {RegExp} regexp
   * @api public
   */
  
  match: function(regexp){
    this.assert(
        regexp.exec(this.obj)
      , 'expected ' + this.inspect + ' to match ' + regexp
      , 'expected ' + this.inspect + ' not to match ' + regexp);
    return this;
  },
  
  /**
   * Assert property "length" exists and has value of _n_.
   *
   * @param {Number} n
   * @api public
   */
  
  length: function(n){
    this.obj.should.have.property('length');
    var len = this.obj.length;
    this.assert(
        n == len
      , 'expected ' + this.inspect + ' to have a length of ' + n + ' but got ' + len
      , 'expected ' + this.inspect + ' to not have a length of ' + len);
    return this;
  },
  
  /**
   * Assert substring.
   *
   * @param {String} str
   * @api public
   */

  string: function(str){
    this.obj.should.be.a('string');
    this.assert(
        ~this.obj.indexOf(str)
      , 'expected ' + this.inspect + ' to include ' + i(str)
      , 'expected ' + this.inspect + ' to not include ' + i(str));
    return this;
  },

  /**
   * Assert property _name_ exists, with optional _val_.
   *
   * @param {String} name
   * @param {Mixed} val
   * @api public
   */
  
  property: function(name, val){
    if (this.negate && undefined !== val) {
      if (undefined === this.obj[name]) {
        throw new Error(this.inspect + ' has no property ' + i(name));
      }
    } else {
      this.assert(
          undefined !== this.obj[name]
        , 'expected ' + this.inspect + ' to have a property ' + i(name)
        , 'expected ' + this.inspect + ' to not have a property ' + i(name));
    }
    
    if (undefined !== val) {
      this.assert(
          val === this.obj[name]
        , 'expected ' + this.inspect + ' to have a property ' + i(name)
          + ' of ' + i(val) + ', but got ' + i(this.obj[name])
        , 'expected ' + this.inspect + ' to not have a property ' + i(name) + ' of ' + i(val));
    }

    this.obj = this.obj[name];
    return this;
  },
  
  /**
   * Assert own property _name_ exists.
   *
   * @param {String} name
   * @api public
   */
  
  ownProperty: function(name){
    this.assert(
        this.obj.hasOwnProperty(name)
      , 'expected ' + this.inspect + ' to have own property ' + i(name)
      , 'expected ' + this.inspect + ' to not have own property ' + i(name));
    return this;
  },

  /**
   * Assert that `obj` is present via `.indexOf()`.
   *
   * @param {Mixed} obj
   * @api public
   */

  include: function(obj){
    this.assert(
        ~this.obj.indexOf(obj)
      , 'expected ' + this.inspect + ' to include ' + i(obj)
      , 'expected ' + this.inspect + ' to not include ' + i(obj));

    return this;
  },

  /**
   * Assert that the array contains _obj_.
   *
   * @param {Mixed} obj
   * @api public
   */

  contain: function(obj){
    console.warn('should.contain() is deprecated, use should.include()');
    this.obj.should.be.an.instanceof(Array);
    this.assert(
        ~this.obj.indexOf(obj)
      , 'expected ' + this.inspect + ' to contain ' + i(obj)
      , 'expected ' + this.inspect + ' to not contain ' + i(obj));
    return this;
  },
  
  /**
   * Assert exact keys or inclusion of keys by using
   * the `.include` modifier.
   *
   * @param {Array|String ...} keys
   * @api public
   */
  
  keys: function(keys){
    var str
      , ok = true;

    keys = keys instanceof Array
      ? keys
      : Array.prototype.slice.call(arguments);

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(this.obj)
      , len = keys.length;

    // make sure they're all present
    ok = keys.every(function(key){
      return ~actual.indexOf(key);
    });

    // matching length
    ok = ok && keys.length == actual.length;

    // key string
    if (len > 1) {
      keys = keys.map(function(key){
        return i(key);
      });
      var last = keys.pop();
      str = keys.join(', ') + ', and ' + last;
    } else {
      str = i(keys[0]);
    }

    // message
    str = 'have ' + (len > 1 ? 'keys ' : 'key ') + str;

    this.assert(
        ok
      , 'expected ' + this.inspect + ' to ' + str
      , 'expected ' + this.inspect + ' to not ' + str);

    return this;
  },
  
  /**
   * Assert that header `field` has the given `val`. 
   *
   * @param {String} field
   * @param {String} val
   * @return {Assertion} for chaining
   * @api public
   */

  header: function(field, val){
    this.obj.should
      .have.property('headers').and
      .have.property(field.toLowerCase(), val);
    return this;
  },
  
  /**
   * Assert `.statusCode` of `code`.
   *
   * @param {Number} code
   * @return {Assertion} for chaining
   * @api public
   */

  status:  function(code){
    this.obj.should.have.property('statusCode');
    var status = this.obj.statusCode;

    this.assert(
        code == status
      , 'expected response code of ' + code + ' ' + i(statusCodes[code])
        + ', but got ' + status + ' ' + i(statusCodes[status])
      , 'expected to not respond with ' + code + ' ' + i(statusCodes[code]));

    return this;
  },

  /**
   * Assert that this function will or will not
   * throw an exception.
   *
   * @return {Assertion} for chaining
   * @api public
   */

  throw: function(){
    var fn = this.obj
      , err = {}
      , ok = true;

    try {
      fn();
      ok = false;
    } catch (e) {
      err = e;
    }

    this.assert(
        ok
      , 'expected an exception to be thrown'
      , 'expected no exception to be thrown, got "' + err.message + '"');

    return this;
  }
};

/**
 * Aliases.
 */

(function alias(name, as){
  Assertion.prototype[as] = Assertion.prototype[name];
  return alias;
})
('length', 'lengthOf')
('keys', 'key')
('ownProperty', 'haveOwnProperty')
('above', 'greaterThan')
('below', 'lessThan');

