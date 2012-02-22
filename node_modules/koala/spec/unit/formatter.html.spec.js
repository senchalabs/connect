
HTML = require('koala/formatters/html').HTML

describe 'formatters'
  describe 'HTML'
    describe '.render()'
      it 'should render html'
        var ruby = new Lexer({
          keyword: /^(def|end)\b/,
          constant: /^([A-Z]\w*|__FILE__)/,
          string: /^(".*?")/,
          id: /^(\w+)/
        })
        var html = HTML.render(ruby, 'def foo\n "bar" & "that" end')
        html.should.not.include '<span> </span>'
        html.should.include '<span class="keyword">def</span>'
        html.should.include '\n'
        html.should.include '&'
      end
    end
  end
end