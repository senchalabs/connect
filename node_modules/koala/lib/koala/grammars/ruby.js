
// Koala - Grammars - Ruby - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Module dependencies.
 */
 
var Lexer = require('./../lexer').Lexer

// --- Grammar

exports.Ruby = new Lexer({
  'this': 'self',
  'number float': /^(\d+\.\d+)/,
  'number integer': /^(\d+)/,
  'comment': /^(#[^\n]*)/,
  'keyword': /^(return|defined|alias|and|begin|BEGIN|break|case|class|def|do|else|if|END|end|ensure|false|true|for|in|module|next|nil|not|or|redo|rescue|retry|return|super|then|when|true|undef|unless|until|while|yield)\b/,
  'string': /^("(.*?)"|'(.*?)')/,
  'symbol string': /^(\:(\w+|".*?"|'.*?'))/,
  'class': /^((\:\:)?[A-Z]\w*)/,
  'global variable': /^(\$[!@&`'+~=\/\w\\,;<>*$?:"\-]+)/,
  'class variable': /^(@@\w+)/,
  'inst variable': /^(@\w+)/,
  'variable': /^([a-z_]\w*)/,
  'regexp': /^(\/(.*?)\/[a-z]*)/,
  'multiline comment': function(str){
    var buf = '=begin'
    if (str.indexOf('=begin') !== 0)
      return
    str = str.substr(6)
    while (true)
      if (str.indexOf('=end') === 0)
        break
      else
        buf += str.charAt(0),
        str = str.substr(1)
    str = str.substr(4)
    return buf + '=end'
  }
})