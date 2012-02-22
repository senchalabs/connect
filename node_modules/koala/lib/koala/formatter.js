
// Koala - Formatter - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Initialize with formatter function.
 */

function Formatter(fn) {
  if (typeof fn !== 'function')
    throw new TypeError('Formatter requires a function')
  this.fn = fn
}

/**
 * Render _str_ using the given _lexer_.
 *
 * @param  {Lexer} lexer
 * @param  {string} str
 * @return {string}
 * @api public
 */

Formatter.prototype.render = function(lexer, str) {
  var self = this
  if (typeof lexer.scan !== 'function')
    throw new TypeError('Formatter#render() requires a lexer to be passed')
  return lexer.scan(str).map(function(token){
    return self.fn.call(self, token[0], token[1])
  }).join('')
}

exports.Formatter = Formatter