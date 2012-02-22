
// Koala - Grammars - JavaScript - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Module dependencies.
 */
 
var Lexer = require('./../lexer').Lexer

// --- Grammar

exports.JavaScript = new Lexer({
  'this': 'this',
  'number float': /^(\d+\.\d+)/,
  'number integer': /^(\d+)/,
  'comment': /^(\/\/[^\n]*)/,
  'keyword': /^(null|break|continue|do|for|import|new|void|case|default|else|function|in|return|typeof|while|delete|export|if|else|label|switch|var|with|catch|class|const|debugger|enum|extends|throw|try|finally|super|NaN)\b/,
  'string': /^("(.*?)"|'(.*?)')/,
  'class': /^([A-Z]\w*)/,
  'variable': /^([a-z_]\w*)/,
  'multiline comment': function(str){
    var buf = '/*'
    if (str.charAt(0) !== '/' ||
        str.charAt(1) !== '*')
      return
    str = str.substr(2)
    while (true)
      if (str.charAt(0) === '*' &&
          str.charAt(1) === '/')
        break
      else
        buf += str.charAt(0),
        str = str.substr(1)
    str = str.substr(2)
    return buf + '*/'
  },
  'regexp': /^(\/(.*?)\/[a-z]*)/
})