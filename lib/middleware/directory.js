
/*!
 * Connect - directory
 * Copyright(c) 2011 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

// TODO: arrow key navigation

/**
 * Module dependencies.
 */

var fs = require('fs')
  , parse = require('url').parse
  , utils = require('../utils')
  , path = require('path')
  , normalize = path.normalize
  , extname = path.extname
  , join = path.join;

/*!
 * Icon cache.
 */

var cache = {};

/**
 * Directory:
 *
 * Serve directory listings with the given `root` path.
 *
 * Options:
 *
 *  - `hidden` display hidden (dot) files. Defaults to false.
 *  - `icons`  display icons. Defaults to false.
 *  - `filter` Apply this filter function to files. Defaults to false.
 *  - `view`   set file view to use. Defaults to 'tiles'.
 *  - `sort`   set sorting options to use.
 *
 * @param {String} root
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function directory(root, options){
  options = options || {};

  // root required
  if (!root) throw new Error('directory() root path required');
  var hidden = options.hidden
    , icons = options.icons
    , filter = options.filter
    , sort = options.sort || {by: 'name', asc: true}
    , view = options.view || 'tiles'
    , root = normalize(root);

  return function directory(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();

    var accept = req.headers.accept || 'text/plain'
      , url = parse(req.url)
      , dir = decodeURIComponent(url.pathname)
      , path = normalize(join(root, dir))
      , originalUrl = parse(req.originalUrl)
      , originalDir = decodeURIComponent(originalUrl.pathname)
      , showUp = path != root && path != root + '/';

    // null byte(s), bad request
    if (~path.indexOf('\0')) return next(utils.error(400));

    // malicious path, forbidden
    if (0 != path.indexOf(root)) return next(utils.error(403));

    // check if we have a directory
    fs.stat(path, function(err, stat){
      if (err) return 'ENOENT' == err.code
        ? next()
        : next(err);

      if (!stat.isDirectory()) return next();

      // fetch files
      fs.readdir(path, function(err, files){
        if (err) return next(err);
        if (!hidden) files = removeHidden(files);
        if (filter) files = files.filter(filter);
        
        stats(path, files, function (err, dirs, files) {
          if (err) return next(err);
          files = sorter(dirs, files, sort);
          
          // content-negotiation
          for (var key in exports) {
            if (~accept.indexOf(key) || ~accept.indexOf('*/*')) {
              exports[key]
              (req, res, files, next, originalDir, showUp, icons, view);
              return;
            }
          }

          // not acceptable
          next(utils.error(406));
        });
      });
    });
  };
};

/**
 * Respond with text/html.
 */

exports.html = function(req, res, files, next, dir, showUp, icons, view){
  fs.readFile(__dirname + '/../public/directory.html', 'utf8', function(err, str){
    if (err) return next(err);
    fs.readFile(__dirname + '/../public/style.css', 'utf8', function(err, style){
      if (err) return next(err);
      if (showUp) files.unshift({name: '..'});
      str = str
        .replace('{style}', style)
        .replace('{iconstyle}', iconStyle(files, icons))
        .replace('{files}', html(files, dir, icons, view))
        .replace('{directory}', dir)
        .replace('{linked-path}', htmlPath(dir));
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Length', str.length);
      res.end(str);
    });
  });
};

/**
 * Respond with application/json.
 */

exports.json = function(req, res, files){
  files = JSON.stringify(files);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', files.length);
  res.end(files);
};

/**
 * Respond with text/plain.
 */

exports.plain = function(req, res, files){
  files = JSON.stringify(files);
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', files.length);
  res.end(files);
};

/**
 * Map html `dir`, returning a linked path.
 */

function htmlPath(dir) {
  var curr = [];
  return dir.split('/').map(function(part){
    curr.push(part);
    return '<a href="' + curr.join('/') + '">' + part + '</a>';
  }).join(' / ');
}

/**
 * Load icon images, return css string.
 */

function iconStyle (files, useIcons) {
  if (!useIcons) return '';
  var data = {},
    size = ['16x16', '32x32', '48x48'];
  var views = { tiles: [], mobile: [] };

  for (var i=0; i < files.length; i++) {
    var file = files[i];
    if (file.name == '..') continue;

    var ext = file.isDirectory() ? '.directory' : extname(file.name),
      icon = icons[ext] || icons.default;

    if (data[icon]) continue;
    data[icon] = {};
    for (var j=0; j < size.length; j++) {
      data[icon][size[j]] = ext
        + ' span{background: url(data:image/png;base64,'
        + load(icon, size[j])+');}';
    }
    views.tiles.push('.view-tiles ' + data[icon]['16x16']);
    views.mobile.push('#files ' + data[icon]['32x32']);
  }

  var style = views.tiles.join('\n')
    + '\n@media (max-width: 768px) {\n\t'
    + views.mobile.join('\n\t')
    + '\n}';
  return style;
}

/**
 * Map html `files`, returning an html unordered list.
 */

function html(files, dir, useIcons, view) {
  return '<ul id="files" class="view-'+view+'">' + files.map(function(file){
    var icon = ''
      , classes = [];

    if (useIcons && '..' != file.name) {
      var ext = file.isDirectory()
        ? 'directory'
        : extname(file.name).replace('.', '');
      icon = '<span>&nbsp;</span>';
      classes.push('icon');
      classes.push(ext);
    }

    return '<li><a href="'
      + join(dir, file.name)
      + '" class="'
      + classes.join(' ') + '"'
      + ' title="' + file.name + '">'
      + icon + file.name + '</a></li>';

  }).join('\n') + '</ul>';
}

/**
 * Get file stats.
 *
 * @param {String} path
 * @param {Array} names
 * @param {Function} callback
 * @return {Array} dirs
 * @return {Array} files
 * @api private
 */

function stats (path, names, fn) {
  var dirs = [], files = [];
  function loop (index) {
    if (index == names.length) return fn(null, dirs, files)
    var name = names[index];
    fs.stat(join(path, name), function (err, stats) {
      if (err) return fn(err);
      stats.name = name;
      stats.isDirectory() ? dirs.push(stats) : files.push(stats);
      loop(++index);
    });
  }
  loop(0);
}

/**
 * Sort directories and files according to the middleware options.
 *
 * @param {String} a
 * @param {String} b
 * @api private
 */

function sorter (dirs, files, sort) {
  if (sort.dirFirst) {
    dirs.sort(sortAlphabetically);
    files.sort(sortAlphabetically);
    var both = dirs.concat(files);
  } else {
    var both = dirs.concat(files);
    both.sort(sortAlphabetically);
  }
  return both;
}

/**
 * Sort strings alphabetically in ascending order.
 *
 * @param {String} a
 * @param {String} b
 * @api private
 */

function sortAlphabetically(a, b) {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return  1;
  return 0;
}

/**
 * Load and cache the given `icon`.
 *
 * @param {String} icon
 * @return {String}
 * @api private
 */

function load(icon, size) {
  var name = icon+size;
  if (cache[name]) return cache[name];
  return cache[name] = 
    fs.readFileSync(__dirname + '/../public/icons/'+size+'/' + icon, 'base64');
}

/**
 * Filter "hidden" `files`, aka files
 * beginning with a `.`.
 *
 * @param {Array} files
 * @return {Array}
 * @api private
 */

function removeHidden(files) {
  return files.filter(function(file){
    return '.' != file[0];
  });
}

/**
 * Icon map.
 */

var icons = {
    '.js': 'application-javascript.png'
  , '.c': 'text-x-csrc.png'
  , '.h': 'text-x-chdr.png'
  , '.cc': 'text-x-c++src.png'
  , '.php': 'application-x-php.png'
  , '.rb': 'application-x-ruby.png'
  , '.cpp': 'text-x-c++src.png'
  , '.swf': 'application-x-shockwave-flash.png'
  , '.pdf': 'application-pdf.png'
  , '.xml': 'text-xml.png'
  , '.sql': 'text-x-sql.png'
  , '.html': 'text-html.png'
  , '.css': 'text-css.png'
  , '.py': 'text-x-python.png'
  , 'default': 'unknown.png'
  , '.directory': 'folder-orange.png'
};
