
// Koala - Core - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Version.
 */

exports.version = '0.1.2'

/**
 * Module dependencies.
 */
 
var path = require('path'),
    HTML = require('./koala/formatters/html').HTML,
    JavaScript = require('./koala/grammars/javascript').JavaScript,
    Ruby = require('./koala/grammars/ruby').Ruby,
    C = require('./koala/grammars/c').C
  
/**
 * Grammar map.
 */
    
exports.map = {
  '.js': JavaScript,
  '.rb': Ruby,
  '.h': C,
  '.c': C
}

/**
 * Render _str_ as _type_, with optional _formatter_ 
 * defaulting to HTML. _str_ should be a filename or
 * extension such as '.js'.
 *
 * @param  {string} type
 * @param  {string} str
 * @param  {Formatter} formatter
 * @return {string}
 * @api public
 */

exports.render = function(type, str, formatter) {
  var grammar = exports.map[path.extname(type) || type],
      formatter = formatter || HTML
  if (!grammar) throw new Error("syntax highlighting for `" + type + "' is not supported")
  return formatter.render(grammar, str)
}