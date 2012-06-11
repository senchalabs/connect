
var connect = require('../')
  , utils = connect.utils;

describe('utils.uid(len)', function(){
  it('should generate a uid of the given length', function(){
    var n = 20;
    while (n--) utils.uid(n).should.have.length(n);
    utils.uid(10).should.not.equal(utils.uid(10));
  })
})

describe('utils.parseCacheControl(str)', function(){
  it('should parse Cache-Control', function(){
    var parse = utils.parseCacheControl;
    parse('no-cache').should.eql({ 'no-cache': true });
    parse('no-store').should.eql({ 'no-store': true });
    parse('no-transform').should.eql({ 'no-transform': true });
    parse('only-if-cached').should.eql({ 'only-if-cached': true });
    parse('max-age=0').should.eql({ 'max-age': 0 });
    parse('max-age=60').should.eql({ 'max-age': 60 });
    parse('max-stale=60').should.eql({ 'max-stale': 60 });
    parse('min-fresh=60').should.eql({ 'min-fresh': 60 });
    parse('public, max-age=60').should.eql({ 'public': true, 'max-age': 60 });
    parse('must-revalidate, max-age=60').should.eql({ 'must-revalidate': true, 'max-age': 60 });
  })
})

describe('utils.[un]sign()', function(){
  it('should sign & unsign values', function(){
    var val = utils.sign('something', 'foo');
    val.should.equal('something.8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k');

    val = utils.unsign('something.8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k', 'foo');
    val.should.equal('something');

    // make sure cookie values with periods don't trump the signature
    val = utils.sign('something.for.nothing', 'foo');
    val.should.equal('something.for.nothing.s/7V7+RZexRSazB9x2sNFUyhMnrdxnnh5zmnrWZJyHA');

    val = utils.unsign('something.for.nothing.s/7V7+RZexRSazB9x2sNFUyhMnrdxnnh5zmnrWZJyHA', 'foo');
    val.should.equal('something.for.nothing');

    // invalid secret
    val = utils.unsign('something.8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k', 'something');
    val.should.be.false;

    // invalid value
    val = utils.unsign('somethingINVALID.8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k', 'foo');
    val.should.be.false;

    // invalid sig
    val = utils.unsign('something.INVALID8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k', 'foo');
    val.should.be.false;
  })
})

describe('utils.mime(req)', function(){
  it('should return the mime-type from Content-Type', function(){
    utils.mime({ headers: { 'content-type': 'text/html; charset=utf8' }})
      .should.equal('text/html');

    utils.mime({ headers: { 'content-type': 'text/html; charset=utf8' }})
      .should.equal('text/html');

    utils.mime({ headers: { 'content-type': 'text/html' }})
      .should.equal('text/html');
  })
})
