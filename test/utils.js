
var connect = require('../')
  , utils = connect.utils;

describe('utils.uid()', function(){
  it('should generate a uid of the given length', function(){
    var n = 20;
    while (n--) utils.uid(n).should.have.length(n);
    utils.uid(10).should.not.equal(utils.uid(10));
  })
})
