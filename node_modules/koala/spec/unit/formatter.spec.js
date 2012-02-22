
Formatter = require('koala/formatter').Formatter

describe 'Formatter'
  describe '.render()'
    it 'should render using the given callback'
      var ruby = new Lexer({
        keyword: /^(def|end)\b/,
        constant: /^([A-Z]\w*|__FILE__)/,
        string: /^(".*?")/,
        id: /^(\w+)/
      })
      var formatter = new Formatter(function(key, val){
        return key === null 
          ? val
          : '<span class="' + key + '">' + val + '</span>'
      })
      var html = formatter.render(ruby, 'def foo\n  "bar"\nend')
      html.should.not.include '<span> </span>'
      html.should.include '<span class="keyword">def</span>'
    end
  end
end