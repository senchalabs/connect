
C = require('koala/grammars/c').C

describe 'grammars'
  describe 'C'
    it 'should scan simple strings'
      C.scan('"foo"').should.eql [['string', '"foo"']]
      C.scan("'bar'").should.eql [['string', "'bar'"]]
    end
    
    it 'should scan variables'
      C.scan('fooBarBaz').should.eql [['variable', 'fooBarBaz']]
      C.scan('foo_bar_baz64').should.eql [['variable', 'foo_bar_baz64']]
      C.scan('__dirname').should.eql [['variable', '__dirname']]
    end
    
    it 'should scan numbers'
      C.scan('99').should.eql [['number integer', '99']]
      C.scan('15.99').should.eql [['number float', '15.99']]
    end
    
    it 'should scan uppercase ids as classes'
      C.scan('B').should.eql [['class', 'B']]
      C.scan('Array').should.eql [['class', 'Array']]
      C.scan('Base64').should.eql [['class', 'Base64']]
      C.scan('Base_64').should.eql [['class', 'Base_64']]
    end
    
    it 'should scan keywords'
      C.scan('return').should.eql [['keyword', 'return']]
      C.scan('float').should.eql [['keyword', 'float']]
    end
    
    it 'should scan pre-processor directives'
      C.scan('#ifndef VERSION').should.eql [['directive', '#ifndef VERSION']]
      C.scan('#define VERSION "0.0.1"').should.include ['directive', '#define VERSION']
    end
    
    it 'should not scan ids as keywords'
      C.scan('returning').should.not.include ['keyword', 'returning']
      C.scan('floating').should.not.include ['keyword', 'floating']
    end
    
    it 'should scan single-line comments'
      C.scan('// foo bar\nreturn').should.eql [['comment', '// foo bar'], [null, '\n'], ['keyword', 'return']]
    end
    
    it 'should scan span comments'
      C.scan('/* foo bar */').should.eql [['multiline comment', '/* foo bar */']]
    end
    
    it 'should scan multi-line span comments'
      C.scan('/* foo\n bar\n */').should.eql [['multiline comment', '/* foo\n bar\n */']]
    end
  end
end