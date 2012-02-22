
Lexer = require('koala/lexer').Lexer

describe 'Lexer'
  describe '#scan()'
    it 'should scan the given hash of rules'
      var lexer = new Lexer({
        keyword: /^(def|end)\b/,
        constant: /^([A-Z]\w*|__FILE__)/,
        string: function(str){
          if (str.charAt(0) !== '"') return
          var buf = '"',
              str = str.substr(1)
          while (str.charAt(0) !== '' && str.charAt(0) !== '"')
            buf += str.charAt(0),
            str = str.substr(1)
          return buf + '"'
        },
        id: /^(\w+)/
      })
      var tokens = lexer.scan('\ndef foo; "bar" end Array __FILE__')
      var expected = [
          [null, '\n'],
          ['keyword', 'def'],
          [null, ' '],
          ['id', 'foo'],
          [null, ';'],
          [null, ' '],
          ['string', '"bar"'],
          [null, ' '],
          ['keyword', 'end'],
          [null, ' '],
          ['constant', 'Array'],
          [null, ' '],
          ['constant', '__FILE__']
        ]
      tokens.should.eql expected
    end
  end
end