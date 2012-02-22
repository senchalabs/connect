
// Koala - Grammars - C - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Module dependencies.
 */
 
var Lexer = require('./../lexer').Lexer

// --- Grammar

exports.C = new Lexer({
  'directive': /^(#\w+ *\w+)/,
  'number float': /^(\d+\.\d+)/,
  'number integer': /^(\d+)/,
  'comment': /^(\/\/[^\n]*)/,
  'keyword': /^(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/,
  'string': /^("(.*?)"|'(.*?)')/,
  'class': /^([A-Z]\w*)/,
  'variable': /^([a-z_]\w*)/,
  'multiline comment': function(str){
    var buf = '/*'
    if (str.indexOf('/*') !== 0)
      return
    str = str.substr(2)
    while (true)
      if (str.indexOf('*/') === 0)
        break
      else
        buf += str.charAt(0),
        str = str.substr(1)
    str = str.substr(2)
    return buf + '*/'
  }
})