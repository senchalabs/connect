
/*!
 * Dox
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var markdown = require('github-flavored-markdown').parse;

/**
 * Library version.
 */

exports.version = '0.0.5';

/**
 * Parse comments in the given string of `js`.
 *
 * @param {String} js
 * @return {Array}
 * @see exports.parseComment
 * @api public
 */

exports.parseComments = function(js){
  var comments = []
    , comment
    , buf = ''
    , ignore
    , within
    , code;

  for (var i = 0, len = js.length; i < len; ++i) {
    // start comment
    if ('/' == js[i] && '*' == js[i+1]) {
      // code following previous comment
      if (buf.trim().length) {
        comment = comments[comments.length - 1];
        comment.code = code = buf.trim();
        comment.ctx = exports.parseCodeContext(code);
        buf = '';
      }
      i += 2;
      within = true;
      ignore = '!' == js[i];
    // end comment
    } else if ('*' == js[i] && '/' == js[i+1]) {
      i += 2;
      buf = buf.replace(/^ *\* ?/gm, '');
      var comment = exports.parseComment(buf);
      comment.ignore = ignore;
      comments.push(comment);
      within = ignore = false;
      buf = '';
    // buffer comment or code
    } else {
      buf += js[i];
    }
  }

  // trailing code
  if (buf.trim().length) {
    comment = comments[comments.length - 1];
    code = buf.trim();
    comment.code = code;
  }

  return comments;
};

/**
 * Parse the given comment `str`.
 *
 * The comment object returned contains the following:
 *
 *  - `tags`  array of tag objects
 *  - `description` the first line of the comment
 *  - `body` lines following the description
 *  - `content` both the description and the body
 *  - `isPrivate` true when "@api private" is used
 *
 * @param {String} str
 * @return {Object}
 * @see exports.parseTag
 * @api public
 */

exports.parseComment = function(str) {
  str = str.trim();
  var comment = { tags: [] }
    , description = {};

  // parse comment body
  description.full = str.split('@')[0].replace(/^([\w ]+):/gm, '## $1');
  description.summary = description.full.split('\n\n')[0];
  description.body = description.full.split('\n\n').slice(1).join('\n\n');
  comment.description = description;

  // parse tags
  if (~str.indexOf('@')) {
    var tags = '@' + str.split('@').slice(1).join('@');
    comment.tags = tags.split('\n').map(exports.parseTag);
    comment.isPrivate = comment.tags.some(function(tag){
      return 'api' == tag.type && 'private' == tag.visibility;
    })
  }

  // markdown
  description.full = markdown(escape(description.full));
  description.summary = markdown(escape(description.summary));
  description.body = markdown(escape(description.body));

  return comment;
}

/**
 * Parse tag string "@param {Array} name description" etc.
 *
 * @param {String}
 * @return {Object}
 * @api public
 */

exports.parseTag = function(str) {
  var tag = {} 
    , parts = str.split(/ +/)
    , type = tag.type = parts.shift().replace('@', '');

  /* shouldn't fail */
  switch (type) { // asfasdfasdf /** /////
    case 'param':
      tag.types = exports.parseTagTypes(parts.shift());
      tag.name = parts.shift() || '';
      tag.description = parts.join(' ');
      break;
    case 'return':
      tag.types = exports.parseTagTypes(parts.shift());
      tag.description = parts.join(' ');
      break;
    case 'see':
      if (~str.indexOf('http')) {
        tag.title = parts.length > 1
          ? parts.shift()
          : '';
        tag.url = parts.join(' ');
      } else {
        tag.local = parts.join(' ');
      }
    case 'api':
      tag.visibility = parts.shift();
      break;
    case 'type':
      tag.types = exports.parseTagTypes(parts.shift());
      break;
  }

  return tag;
}

/**
 * Parse tag type string "{Array|Object}" etc.
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */

exports.parseTagTypes = function(str) {
  return str
    .replace(/[{}]/g, '')
    .split(/ *[|,\/] */);
};

/**
 * Parse the context from the given `str` of js.
 *
 * This method attempts to discover the context
 * for the comment based on it's code. Currently
 * supports:
 *
 *   - function statements
 *   - function expressions
 *   - prototype methods
 *   - prototype properties
 *   - methods
 *   - properties
 *   - declarations
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parseCodeContext = function(str){
  var str = str.split('\n')[0];

  // function statement
  if (/^function (\w+)\(/.exec(str)) {
    return {
        type: 'function'
      , name: RegExp.$1
    };
  // function expression
  } else if (/^var *(\w+) *= *function/.exec(str)) {
    return {
        type: 'function'
      , name: RegExp.$1
    };
  // prototype method
  } else if (/^(\w+)\.prototype\.(\w+) *= *function/.exec(str)) {
    return {
        type: 'method'
      , constructor: RegExp.$1
      , name: RegExp.$2
    };
  // prototype property
  } else if (/^(\w+)\.prototype\.(\w+) *= *([^\n;]+)/.exec(str)) {
    return {
        type: 'property'
      , constructor: RegExp.$1
      , name: RegExp.$2
      , value: RegExp.$3
    };
  // method
  } else if (/^(\w+)\.(\w+) *= *function/.exec(str)) {
    return {
        type: 'method'
      , receiver: RegExp.$1
      , name: RegExp.$2
    };
  // property
  } else if (/^(\w+)\.(\w+) *= *([^\n;]+)/.exec(str)) {
    return {
        type: 'property'
      , receiver: RegExp.$1
      , name: RegExp.$2
      , value: RegExp.$3
    };
  // declaration
  } else if (/^var +(\w+) *= *([^\n;]+)/.exec(str)) {
    return {
        type: 'declaration'
      , name: RegExp.$1
      , value: RegExp.$2
    };
  }
};

/**
 * Escape the given `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
