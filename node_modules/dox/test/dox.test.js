
/**
 * Module dependencies.
 */

var dox = require('../')
  , should = require('should')
  , fs = require('fs');

function fixture(name, fn) {
  fs.readFile(__dirname + '/fixtures/' + name, 'utf8', fn);
}

module.exports = {
  'test .version': function(){
    dox.version.should.match(/^\d+\.\d+\.\d+$/);
  },
  
  'test .parseComments() blocks': function(done){
    fixture('a.js', function(err, str){
      var comments = dox.parseComments(str)
        , file = comments.shift()
        , version = comments.shift();
      file.should.have.property('ignore', true);
      file.description.full.should.equal('<p>A<br />Copyright (c) 2010 Author Name <Author Email><br />MIT Licensed</p>');
      file.description.summary.should.equal('<p>A<br />Copyright (c) 2010 Author Name <Author Email><br />MIT Licensed</p>');
      file.description.body.should.equal('');
      file.tags.should.be.empty;

      version.should.have.property('ignore', false);
      version.description.full.should.equal('<p>Library version.</p>');
      version.description.summary.should.equal('<p>Library version.</p>');
      version.description.body.should.equal('');
      version.tags.should.be.empty;
      done();
    });
  },
  
  'test .parseComments() tags': function(done){
    fixture('b.js', function(err, str){
      var comments = dox.parseComments(str);

      var version = comments.shift();
      version.description.summary.should.equal('<p>Library version.</p>');
      version.description.full.should.equal('<p>Library version.</p>');
      version.tags.should.have.length(2);
      version.tags[0].type.should.equal('type');
      version.tags[0].types.should.eql(['String']);
      version.tags[1].type.should.equal('api');
      version.tags[1].visibility.should.equal('public');
      version.ctx.type.should.equal('property');
      version.ctx.receiver.should.equal('exports');
      version.ctx.name.should.equal('version');
      version.ctx.value.should.equal("'0.0.1'");

      var parse = comments.shift();
      parse.description.summary.should.equal('<p>Parse the given <code>str</code>.</p>');
      parse.description.body.should.equal('<h2>Examples</h2>\n\n<pre><code>parse(str)\n// =&amp;gt; "wahoo"\n</code></pre>');
      parse.description.full.should.equal('<p>Parse the given <code>str</code>.</p>\n\n<h2>Examples</h2>\n\n<pre><code>parse(str)\n// =&amp;gt; "wahoo"\n</code></pre>');
      parse.tags[0].type.should.equal('param');
      parse.tags[0].name.should.equal('str');
      parse.tags[0].description.should.equal('to parse');
      parse.tags[0].types.should.eql(['String', 'Buffer']);
      parse.tags[1].type.should.equal('return');
      parse.tags[1].types.should.eql(['String']);
      parse.tags[2].visibility.should.equal('public');
      done();
    });
  },

  'test .parseComments() complex': function(done){
    fixture('c.js', function(err, str){
      var comments = dox.parseComments(str);

      var file = comments.shift();

      file.tags.should.be.empty;
      // the following doesn't work as gh-md now obfuscates emails different on every pass
      //file.description.full.should.equal('<p>Dox<br />Copyright (c) 2010 TJ Holowaychuk <a href=\'mailto:tj@vision-media.ca\'>tj@vision-media.ca</a><br />MIT Licensed</p>');
      file.description.full.should.be.a('string');
      file.ignore.should.be.true;

      var mods = comments.shift();
      mods.tags.should.be.empty;
      mods.description.full.should.equal('<p>Module dependencies.</p>');
      mods.description.summary.should.equal('<p>Module dependencies.</p>');
      mods.description.body.should.equal('');
      mods.ignore.should.be.false;
      mods.code.should.equal('var markdown = require(\'github-flavored-markdown\').parse;');
      mods.ctx.type.should.equal('declaration');
      mods.ctx.name.should.equal('markdown');
      mods.ctx.value.should.equal('require(\'github-flavored-markdown\').parse');

      var version = comments.shift();
      version.tags.should.be.empty;
      version.description.full.should.equal('<p>Library version.</p>');

      var parseComments = comments.shift();
      parseComments.tags.should.have.length(4);
      parseComments.ctx.type.should.equal('method');
      parseComments.ctx.receiver.should.equal('exports');
      parseComments.ctx.name.should.equal('parseComments');
      parseComments.description.full.should.equal('<p>Parse comments in the given string of <code>js</code>.</p>');
      parseComments.description.summary.should.equal('<p>Parse comments in the given string of <code>js</code>.</p>');
      parseComments.description.body.should.equal('');

      var parseComment = comments.shift();
      parseComment.tags.should.have.length(4);
      parseComment.description.summary.should.equal('<p>Parse the given comment <code>str</code>.</p>');
      parseComment.description.full.should.equal('<p>Parse the given comment <code>str</code>.</p>\n\n<h2>The comment object returned contains the following</h2>\n\n<ul>\n<li><code>tags</code>  array of tag objects</li>\n<li><code>description</code> the first line of the comment</li>\n<li><code>body</code> lines following the description</li>\n<li><code>content</code> both the description and the body</li>\n<li><code>isPrivate</code> true when "@api private" is used</li>\n</ul>');
      parseComment.description.body.should.equal('<h2>The comment object returned contains the following</h2>\n\n<ul>\n<li><code>tags</code>  array of tag objects</li>\n<li><code>description</code> the first line of the comment</li>\n<li><code>body</code> lines following the description</li>\n<li><code>content</code> both the description and the body</li>\n<li><code>isPrivate</code> true when "@api private" is used</li>\n</ul>');

      var escape = comments.pop();
      escape.tags.should.have.length(3);
      escape.description.full.should.equal('<p>Escape the given <code>html</code>.</p>');
      escape.ctx.type.should.equal('function');
      escape.ctx.name.should.equal('escape');
      done();
    });
  },
  
  'test .parseComments() tags': function (done){
    fixture('d.js', function(err, str){
      var comments = dox.parseComments(str);
      var first = comments.shift();
      first.tags.should.have.length(4);
      first.description.full.should.equal('<p>Parse tag type string "{Array|Object}" etc.</p>');
      first.description.summary.should.equal('<p>Parse tag type string "{Array|Object}" etc.</p>');
      first.description.body.should.equal('');
      first.ctx.type.should.equal('method');
      first.ctx.receiver.should.equal('exports');
      first.ctx.name.should.equal('parseTagTypes');
      first.code.should.equal('exports.parseTagTypes = function(str) {\n  return str\n    .replace(/[{}]/g, \'\')\n    .split(/ *[|,\\/] */);\n};');
      done();
    });
  },
  
  'test .parseComments() code': function(done){
    fixture('b.js', function(err, str){
      var comments = dox.parseComments(str)
        , version = comments.shift()
        , parse = comments.shift();

      version.code.should.equal("exports.version = '0.0.1';");
      parse.code.should.equal('exports.parse = function(str) {\n  return "wahoo";\n}');
      done();
    });
  },

  'test .parseCodeContext() function statement': function(){
    var ctx = dox.parseCodeContext('function foo(){\n\n}');
    ctx.type.should.equal('function');
    ctx.name.should.equal('foo');
  },
  
  'test .parseCodeContext() function expression': function(){
    var ctx = dox.parseCodeContext('var foo = function(){\n\n}');
    ctx.type.should.equal('function');
    ctx.name.should.equal('foo');
  },
  
  'test .parseCodeContext() prototype method': function(){
    var ctx = dox.parseCodeContext('User.prototype.save = function(){}');
    ctx.type.should.equal('method');
    ctx.constructor.should.equal('User');
    ctx.name.should.equal('save');
  },
  
  'test .parseCodeContext() prototype property': function(){
    var ctx = dox.parseCodeContext('Database.prototype.enabled = true;\nasdf');
    ctx.type.should.equal('property');
    ctx.constructor.should.equal('Database');
    ctx.name.should.equal('enabled');
    ctx.value.should.equal('true');
  },
  
  'test .parseCodeContext() method': function(){
    var ctx = dox.parseCodeContext('user.save = function(){}');
    ctx.type.should.equal('method');
    ctx.receiver.should.equal('user');
    ctx.name.should.equal('save');
  },
  
  'test .parseCodeContext() property': function(){
    var ctx = dox.parseCodeContext('user.name = "tj";\nasdf');
    ctx.type.should.equal('property');
    ctx.receiver.should.equal('user');
    ctx.name.should.equal('name');
    ctx.value.should.equal('"tj"');
  },
  
  'test .parseCodeContext() declaration': function(){
    var ctx = dox.parseCodeContext('var name = "tj";\nasdf');
    ctx.type.should.equal('declaration');
    ctx.name.should.equal('name');
    ctx.value.should.equal('"tj"');
  },

  'test .parseTag() @constructor': function(){
    var tag = dox.parseTag('@constructor');
    tag.type.should.equal('constructor');
  },
  
  'test .parseTag() @see': function(){
    var tag = dox.parseTag('@see http://google.com');
    tag.type.should.equal('see');
    tag.title.should.equal('');
    tag.url.should.equal('http://google.com');
    
    var tag = dox.parseTag('@see Google http://google.com');
    tag.type.should.equal('see');
    tag.title.should.equal('Google');
    tag.url.should.equal('http://google.com');
    
    var tag = dox.parseTag('@see exports.parseComment');
    tag.type.should.equal('see');
    tag.local.should.equal('exports.parseComment');
   },
  
  'test .parseTag() @api': function(){
    var tag = dox.parseTag('@api private');
    tag.type.should.equal('api');
    tag.visibility.should.equal('private');
  },
  
  'test .parseTag() @type': function(){
    var tag = dox.parseTag('@type {String}');
    tag.type.should.equal('type');
    tag.types.should.eql(['String']);
  },
  
  'test .parseTag() @param': function(){
    var tag = dox.parseTag('@param {String|Buffer}');
    tag.type.should.equal('param');
    tag.types.should.eql(['String', 'Buffer']);
    tag.name.should.equal('');
    tag.description.should.equal('');
  },
  
  'test .parseTag() @return': function(){
    var tag = dox.parseTag('@return {String} a normal string');
    tag.type.should.equal('return');
    tag.types.should.eql(['String']);
    tag.description.should.equal('a normal string');
  },
  
  'test .parseTag() default': function(){
    var tag = dox.parseTag('@hello universe is better than world');
    tag.type.should.equal('hello');
    tag.string.should.equal('universe is better than world');
  }
};