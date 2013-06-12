
var connect = require('../')
  , utils = connect.utils;

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
