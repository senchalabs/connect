
Ruby = require('koala/grammars/ruby').Ruby

describe 'grammars'
  describe 'Ruby'
    it 'should scan self as "this"'
      Ruby.scan('self').should.eql [['this', 'self']]  
    end
    
    it 'should scan simple strings'
      Ruby.scan('"foo"').should.eql [['string', '"foo"']]
      Ruby.scan("'bar'").should.eql [['string', "'bar'"]]
    end
    
    it 'should scan symbols'
      Ruby.scan(':foo').should.eql [['symbol string', ':foo']]
      Ruby.scan(':Base64').should.eql [['symbol string', ':Base64']]
      Ruby.scan(':foo_bar').should.eql [['symbol string', ':foo_bar']]
      Ruby.scan(':"baz that"').should.eql [['symbol string', ':"baz that"']]
      Ruby.scan(":'yay'").should.eql [['symbol string', ":'yay'"]]
    end
    
    it 'should scan variables'
      Ruby.scan('fooBarBaz').should.eql [['variable', 'fooBarBaz']]
      Ruby.scan('foo_bar_baz64').should.eql [['variable', 'foo_bar_baz64']]
      Ruby.scan('__dirname').should.eql [['variable', '__dirname']]
    end
    
    it 'should scan global variables'
      Ruby.scan('$foo').should.eql [['global variable', '$foo']]
      Ruby.scan('$1').should.eql [['global variable', '$1']]
      Ruby.scan('$$').should.eql [['global variable', '$$']]
      Ruby.scan('$?').should.eql [['global variable', '$?']]
      Ruby.scan('$:').should.eql [['global variable', '$:']]
      Ruby.scan('$"').should.eql [['global variable', '$"']]
      Ruby.scan('$-I').should.eql [['global variable', '$-I']]
      Ruby.scan('($0)').should.eql [[null, '('], ['global variable', '$0'], [null, ')']]
      Ruby.scan('$SomethingElse').should.eql [['global variable', '$SomethingElse']]
    end
    
    it 'should scan instance variables'
      Ruby.scan('@base64').should.eql [['inst variable', '@base64']]
      Ruby.scan('@foo').should.eql [['inst variable', '@foo']]
      Ruby.scan('@fooBarBaz').should.eql [['inst variable', '@fooBarBaz']]
      Ruby.scan('@foo_bar').should.eql [['inst variable', '@foo_bar']]
      Ruby.scan('@Bar').should.eql [['inst variable', '@Bar']]
    end
    
    it 'should scan class variables'
      Ruby.scan('@@base64').should.eql [['class variable', '@@base64']]
      Ruby.scan('@@foo').should.eql [['class variable', '@@foo']]
      Ruby.scan('@@fooBarBaz').should.eql [['class variable', '@@fooBarBaz']]
      Ruby.scan('@@foo_bar').should.eql [['class variable', '@@foo_bar']]
      Ruby.scan('@@Bar').should.eql [['class variable', '@@Bar']]
    end
    
    it 'should scan numbers'
      Ruby.scan('99').should.eql [['number integer', '99']]
      Ruby.scan('15.99').should.eql [['number float', '15.99']]
    end
    
    it 'should scan uppercase ids as classes'
      Ruby.scan('B').should.eql [['class', 'B']]
      Ruby.scan('Array').should.eql [['class', 'Array']]
      Ruby.scan('Base64').should.eql [['class', 'Base64']]
      Ruby.scan('Base_64').should.eql [['class', 'Base_64']]
      Ruby.scan('Foo::Bar').should.eql [['class', 'Foo'], ['class', '::Bar']]
      Ruby.scan('::Bar').should.eql [['class', '::Bar']]
    end
    
    it 'should scan keywords'
      Ruby.scan('return').should.eql [['keyword', 'return']]
      Ruby.scan('defined').should.eql [['keyword', 'defined']]
    end
    
    it 'should not scan ids as keywords'
      Ruby.scan('returning').should.not.include ['keyword', 'returning']
      Ruby.scan('redefined').should.not.include ['keyword', 'redefined']
    end
    
    it 'should scan regular expressions'
      Ruby.scan('/foo/gm').should.eql [['regexp', '/foo/gm']]
    end
    
    it 'should scan single-line comments'
      Ruby.scan('# foo bar\nreturn').should.eql [['comment', '# foo bar'], [null, '\n'], ['keyword', 'return']]
    end
    
    it 'should scan span comments'
      Ruby.scan('=begin foo bar =end').should.eql [['multiline comment', '=begin foo bar =end']]
    end
    
    it 'should scan multi-line span comments'
      Ruby.scan('=begin foo\n bar\n =end').should.eql [['multiline comment', '=begin foo\n bar\n =end']]
      Ruby.scan('=begin foo\n *bar\n *\n *\n=end').should.eql [['multiline comment', '=begin foo\n *bar\n *\n *\n=end']]
    end
  end
end