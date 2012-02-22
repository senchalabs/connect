
// Koala - Lexer - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Initialize with hash of _rules_.
 */

function Lexer(rules) {
  this.rules = rules
}

Lexer.prototype = {
  
  /**
   * Scan the given _str_ returning an
   * array of tokens.
   *
   * @param  {string} str
   * @return {array}
   * @api public
   */
  
  scan: function(str) {
    var rule, token, fn,
        str = String(str),
        tokens = []
    while (str.length) {
      for (var key in this.rules)
        if (this.rules.hasOwnProperty(key))
          switch ((rule = this.rules[key]).constructor) {
            case Function:
              var buf
              if ((buf = rule.call(str, str)) != null)
                str = str.substr(buf.length),
                token = [key, buf]
              break
            case String:
              if (str.indexOf(rule) === 0)
                str = str.substr(rule.length),
                token = [key, rule]
              break
            case Array:
              fn = rule[1], rule = rule[0]
            case RegExp:
              if (str.match(rule))
                str = str.substr(RegExp.$1.length),
                token = [key, fn ? fn(RegExp.$1) : RegExp.$1],
                fn = null
              break
            default:
              throw new TypeError("rule `" + key + "' must be a String, RegExp, or Array")
          }
      if (token)
        tokens.push(token),
        token = null
      else
        tokens.push([null, str.charAt(0)]),
        str = str.substr(1)
    }
    return tokens
  }
}

exports.Lexer = Lexer