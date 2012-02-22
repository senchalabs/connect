
describe 'koala'
  describe '.version'
    it 'should be a triplet'
      koala.version.should.match(/^\d+\.\d+\.\d+$/)
    end
  end
  
  describe '.render()'
    it 'should auto-detect the type of file'
      koala.render('.js', '12').should.include '<span class="number integer">12</span>'
      koala.render('foo.bar.js', '12').should.include '<span class="number integer">12</span>'
    end
    
    it 'should throw an error when not supported'
      -{ koala.render('.foo', 'something') }.should.throw_error "syntax highlighting for `.foo' is not supported"
    end
  end
end