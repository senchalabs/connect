
/**
 * Module dependencies.
 */

var utils = require('connect').utils
  , should = require('should');

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

    'test parseCookie()': function(){
      utils.parseCookie('foo=bar').should.eql({ foo: 'bar' });
      utils.parseCookie('SID=123').should.eql({ sid: '123' });

      utils.parseCookie('foo   = bar;  baz    =  raz')
        .should.eql({ foo: 'bar', baz: 'raz' });  

      utils.parseCookie('fbs="uid=0987654321&name=Test+User"')
        .should.eql({ fbs: 'uid=0987654321&name=Test User' });
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
        .serializeCookie('foo', 'foo bar')
        .should.equal('foo=foo%20bar');

      utils.parseCookie(utils.serializeCookie('fbs', 'uid=123&name=Test User'))
        .should.eql({ fbs: 'uid=123&name=Test User' });
    }
};