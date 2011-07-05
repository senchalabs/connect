
require.paths.unshift(__dirname + '/koala/lib');

/**
 * Module dependencies.
 */

var markdown = require('markdown').markdown.toHTML
  , path = require('path')
  , ejs = require('ejs')
  , fs = require('fs');

// meta-data

var meta = {};

// doc data

var docs = [];

// files

var files = meta.files = process.argv.slice(2)
  , pending = files.length;

// templates

var page = ejs.compile(fs.readFileSync(__dirname + '/page.html', 'utf8'));

// destination

var dest = __dirname + '/../docs';

// parse files

files.forEach(function(file){
  fs.readFile(file, 'utf8', function(err, js){
    if (err) throw err;

    // store data
    docs.push({
        comments: comments(js)
      , filename: file
      , basename: path.basename(file)
      , dirname: path.dirname(file)
      , name: path.basename(file, '.js')
    });

    // done
    --pending || render(docs);
  });
});

/**
 * Parse comments in `js`.
 *
 * @param {String} js
 * @return {Array}
 * @api public
 */

function comments(js) {
  var comments = []
    , comment
    , buf = ''
    , ignore
    , within
    , code;

  for (var i = 0, len = js.length; i < len; ++i) {
    // start comment
    if ('/' == js[i] && '*' == js[i+1]) {
      // code following previous comment
      if (buf.trim().length) {
        comment = comments[comments.length - 1];
        comment.method = parseMethod(code = buf.trim());
        comment.code = code;
        buf = '';
      }
      i += 2;
      within = true;
      ignore = '!' == js[i];
    // end comment
    } else if ('*' == js[i] && '/' == js[i+1]) {
      i += 2;
      buf = buf.replace(/^ *\* ?/gm, '');
      var comment = parseComment(buf);
      comment.ignore = ignore;
      comments.push(comment);
      within = ignore = false;
      buf = '';
    // buffer comment or code
    } else {
      buf += js[i];
    }
  }

  return comments;
}

/**
 * Parse comment string.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

function parseComment(str) {
  str = str.trim();
  var comment = { tags: [] };

  // parse comment body
  comment.content = str.split('@')[0].replace(/^([\w ]+):/gm, '## $1');
  comment.description = comment.content.split('\n\n')[0];
  comment.body = comment.content.split('\n\n').slice(1).join('\n\n');

  // parse tags
  if (~str.indexOf('@')) {
    var tags = '@' + str.split('@').slice(1).join('@');
    comment.tags = tags.split('\n').map(parseTag);
    comment.isPrivate = comment.tags.some(function(tag){
      return 'api' == tag.type && 'private' == tag.visibility;
    })
  }

  // syntax highlighting
  function highlight(str) {
    return str.replace(/<pre><code>([^]+?)<\/code>/g, function(_, js){
      return '<pre><code>' + js + '</code>';
    });
  }

  // markdown
  comment.content = highlight(markdown(comment.content));
  comment.description = highlight(markdown(comment.description));
  comment.body = highlight(markdown(comment.body));


  return comment;
}

/**
 * Parse tag string "@param {Array} name description" etc.
 *
 * @param {String}
 * @return {Object}
 * @api public
 */

function parseTag(str) {
  var tag = {} 
    , parts = str.split(/ +/)
    , type = tag.type = parts.shift().replace('@', '');

  switch (type) {
    case 'param':
      tag.types = parseTagTypes(parts.shift());
      tag.name = parts.shift();
      tag.description = parts.join(' ');
      break;
    case 'return':
      tag.types = parseTagTypes(parts.shift());
      break;
    case 'api':
      tag.visibility = parts.shift();
      break;
    case 'type':
      tag.value = parts.shift();
      break;
  }

  return tag;
}

/**
 * Parse tag type string "{Array|Object}" etc.
 *
 * @param {String} str
 * @return {Array}
 * @api public
 */

function parseTagTypes(str) {
  return str
    .replace(/[{}]/g, '')
    .split(/ *[|,\/] */);
}

function parseMethod(str) {
  var captures;
  if (captures = /(?:exports\.|function |prototype\.)(\w+)/.exec(str)) {
    return captures[1];
  }
}

/**
 * Render the given array of `docs`.
 *
 * @param {Array} docs
 * @api public
 */

function render(docs) {
  fs.writeFile(dest + '/meta.json', JSON.stringify(meta));
  docs.forEach(renderFile);
}

/**
 * Render single documentation file.
 *
 * @param {Object} doc
 * @api public
 */

function renderFile(doc) {
  // output destination
  var out = dest + '/' + doc.filename
    .replace(/\//g, '-')
    .replace('.js', '.html')
    .replace('lib-', '');

  // template
  var html = page(doc);

  // save template
  fs.writeFile(out, html, function(err){
    console.log('  \033[90mcompiled\033[0m \033[36m%s\033[0m', doc.filename);
    if (err) throw err;
  });
}