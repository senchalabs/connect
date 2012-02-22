
JavaScript = require('koala/grammars/javascript').JavaScript

describe 'grammars'
  describe 'JavaScript'
    it 'should scan this'
      JavaScript.scan('this').should.eql [['this', 'this']]  
    end
    
    it 'should scan simple strings'
      JavaScript.scan('"foo"').should.eql [['string', '"foo"']]
      JavaScript.scan("'bar'").should.eql [['string', "'bar'"]]
    end
    
    it 'should scan variables'
      JavaScript.scan('fooBarBaz').should.eql [['variable', 'fooBarBaz']]
      JavaScript.scan('foo_bar_baz64').should.eql [['variable', 'foo_bar_baz64']]
      JavaScript.scan('__dirname').should.eql [['variable', '__dirname']]
    end
    
    it 'should scan numbers'
      JavaScript.scan('99').should.eql [['number integer', '99']]
      JavaScript.scan('15.99').should.eql [['number float', '15.99']]
    end
    
    it 'should scan uppercase ids as classes'
      JavaScript.scan('B').should.eql [['class', 'B']]
      JavaScript.scan('Array').should.eql [['class', 'Array']]
      JavaScript.scan('Base64').should.eql [['class', 'Base64']]
      JavaScript.scan('Base_64').should.eql [['class', 'Base_64']]
    end
    
    it 'should scan keywords'
      JavaScript.scan('new').should.eql [['keyword', 'new']]
      JavaScript.scan('NaN').should.eql [['keyword', 'NaN']]
    end
    
    it 'should not scan ids as keywords'
      JavaScript.scan('newly').should.not.include ['keyword', 'new']
      JavaScript.scan('thevariable').should.not.include ['keyword', 'var']
    end
    
    it 'should scan regular expressions'
      JavaScript.scan('/foo/gm').should.eql [['regexp', '/foo/gm']]
    end
    
    it 'should scan single-line comments'
      JavaScript.scan('// foo bar\nnew').should.eql [['comment', '// foo bar'], [null, '\n'], ['keyword', 'new']]
    end
    
    it 'should scan span comments'
      JavaScript.scan('/* foo bar */').should.eql [['multiline comment', '/* foo bar */']]
    end
    
    it 'should scan multi-line span comments'
      JavaScript.scan('/* foo\n bar\n */').should.eql [['multiline comment', '/* foo\n bar\n */']]
      JavaScript.scan('/* foo\n *bar\n *\n *\n*/').should.eql [['multiline comment', '/* foo\n *bar\n *\n *\n*/']]
    end
  end
end