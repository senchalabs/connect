
/**
 * Module dependencies.
 */

var utils = require('../').utils
  , should = require('should')
  , Stream = require('stream').Stream;

module.exports = {
  'test md5()': function(){
    utils.md5('wahoo', 'base64').should.equal('5JMpgGF2EjbJawLqaqiirQ==');
    utils.md5('wahoo').should.equal('e493298061761236c96b02ea6aa8a2ad');
  },

  'test uid()': function(){
    for(var i = 0; i < 100; ++i){
      utils.uid(i).should.have.length(i);
    }
  },

  'test utils.parseCacheControl()': function(){
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
  },

  'test parseCookie()': function(){
    utils.parseCookie('foo=bar').should.eql({ foo: 'bar' });
    utils.parseCookie('sid=123').should.eql({ sid: '123' });

    utils.parseCookie('FOO   = bar;  baz    =  raz')
      .should.eql({ FOO: 'bar', baz: 'raz' });  

    utils.parseCookie('fbs="uid=0987654321&name=Test+User"')
      .should.eql({ fbs: 'uid=0987654321&name=Test User' });

    utils.parseCookie('email=tobi%2Bferret@foo.com')
      .should.eql({ email: 'tobi+ferret@foo.com' });
  },

  'test serializeCookie()': function(){
    utils
      .serializeCookie('foo', 'bar', { path: '/' })
      .should.equal('foo=bar; path=/');

    utils
      .serializeCookie('foo', 'bar', { secure: true })
      .should.equal('foo=bar; secure');

    utils
      .serializeCookie('foo', 'bar', { secure: false })
      .should.equal('foo=bar');

    utils
      .serializeCookie('Foo', 'foo bar')
      .should.equal('Foo=foo%20bar');

    utils.parseCookie(utils.serializeCookie('fbs', 'uid=123&name=Test User'))
      .should.eql({ fbs: 'uid=123&name=Test User' });
  },

  'test sign()': function(){
    var val = utils.sign('something', 'foo');
    val.should.equal('something.KnUAgnazIiUClhgLhvg91JfTBAo');

    val = utils.unsign('something.KnUAgnazIiUClhgLhvg91JfTBAo', 'foo');
    val.should.equal('something');

    // invalid secret
    val = utils.unsign('something.KnUAgnazIiUClhgLhvg91JfTBAo', 'something');
    val.should.be.false;

    // invalid value
    val = utils.unsign('somethingsss.KnUAgnazIiUClhgLhvg91JfTBAo', 'foo');
    val.should.be.false;

    // invalid sig
    val = utils.unsign('something.KnUAgssssssnazIiUClhgLhvg91JfTBAo', 'foo');
    val.should.be.false;
  },

  'test pause()': function(defer){
    var calls = 0
      , data = []
      , req = new Stream;

    req.write = function(data){
      this.emit('data', data);
    };
    req.end = function(){
      this.emit('end');
    };

    var pause = utils.pause(req);

    req.write('one');
    req.write('two');
    req.end();

    req.on('data', function(chunk){
      ++calls;
      data.push(chunk);
    });
    req.on('end', function(){
      ++calls;
      data.should.have.length(2);
    });

    pause.resume();

    defer(function(){
      calls.should.equal(3);
    });
  },
  
  'test .parseRange()': function(){
    utils.parseRange(1000, 'bytes=0-499').should.eql([{ start: 0, end: 499 }]);
    utils.parseRange(1000, 'bytes=40-80').should.eql([{ start: 40, end: 80 }]);
    utils.parseRange(1000, 'bytes=-500').should.eql([{ start: 500, end: 999 }]);
    utils.parseRange(1000, 'bytes=-400').should.eql([{ start: 600, end: 999 }]);
    utils.parseRange(1000, 'bytes=500-').should.eql([{ start: 500, end: 999 }]);
    utils.parseRange(1000, 'bytes=400-').should.eql([{ start: 400, end: 999 }]);
    utils.parseRange(1000, 'bytes=0-0').should.eql([{ start: 0, end: 0 }]);
    utils.parseRange(1000, 'bytes=-1').should.eql([{ start: 999, end: 999 }]);
  }
};