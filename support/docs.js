
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

var layout = fs.readFileSync(__dirname + '/template.html', 'utf8')
  , page = ejs.compile(fs.readFileSync(__dirname + '/page.html', 'utf8'));

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
    , buf = ''
    , ignore
    , within;

  for (var i = 0, len = js.length; i < len; ++i) {
    if ('/' == js[i] && '*' == js[i+1]) {
      i += 2;
      within = true;
      ignore = '!' == js[i];
    } else if ('*' == js[i] && '/' == js[i+1]) {
      i += 2;
      buf = buf.replace(/^ *\* ?/gm, '');
      var comment = parseComment(buf);
      comment.ignore = ignore;
      comments.push(comment);
      within = ignore = false;
      buf = '';
    } else if (within) {
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
  comment.content = str.split('@')[0].replace(/^(\w[^\n:]+):/gm, '## $1');
  comment.description = comment.content.split('\n\n')[0];
  comment.body = comment.content.split('\n\n').slice(1).join('\n\n');

  // parse tags
  if (~str.indexOf('@')) {
    var tags = '@' + str.split('@').slice(1).join('@');
    comment.tags = tags.split('\n').map(parseTag);
  }

  // markdown
  comment.content = markdown(comment.content);
  comment.description = markdown(comment.description);
  comment.body = markdown(comment.body);

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

/**
 * Render the given array of `docs`.
 *
 * @param {Array} docs
 * @api public
 */

function render(docs) {
  fs.writeFile(dest + '/meta.json', JSON.stringify(meta));
  fs.writeFile(dest + '/index.html', layout);
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
    if (err) throw err;
  });
}