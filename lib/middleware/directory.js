
/*!
 * Connect - directory
 * Copyright(c) 2011 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

// TODO: icon / style for directories
// TODO: arrow key navigation
// TODO: make icons extensible

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
 *  - 'stat'   Call stat on each entry. Defaults to false. Sort strategy can set this to true.
 *  - `sort`   Apply sort strategy. Defaults to alphabetical.
 *             Can be string or function passable to Array#sort.
 *             If provided function has needStat property, result of `fs.stat`
 *             plus `.name` are given to compare function
 *             otherwise simple string.
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
    , sort = options.sort
    , doStat = options.stat
    , root = normalize(root);

  if (sort && typeof sort !== 'function') {
    sort = exports.sortMethods[sort];
    if(!sort)
      throw new Error('Invalid sort function name: ' + sort +
                      '\nValid ones are: ' +
                      Object.keys(exports.sortMethods).join(', ') +
                      '\nor custom function');
  }

  doStat = doStat || (sort && sort.needStat);

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
        if (!(sort && sort.needStat))
          files.sort(sort);

        // content-negotiation
        for (var key in exports) {
          if (~accept.indexOf(key) || ~accept.indexOf('*/*')) {
            if (doStat) {
              var pending = files.length;
              var stats = [];
              files.forEach(function(name) {
                fs.stat(join(path, name), function(err, stat) {
                  if(stat) {
                    stat.name = name;
                    stats.push(stat);
                  } else {
                    stats.push({
                      name: name,
                      error: err
                    });
                  }
                  // finish the job if all files stated
                  pending--;
                  if (pending === 0) {
                    if(sort && sort.needStat)
                      stats.sort(sort);
                    files = stats.map(function(stat) { return stat.name; });
                    exports[key](req, res, files, next, originalDir, showUp, icons, stats);
                  }
                });
              });
            } else {
              exports[key](req, res, files, next, originalDir, showUp, icons);
            }
            return;
          }
        }

        // not acceptable
        next(utils.error(406));
      });
    });
  };
};

/**
 * Respond with text/html.
 */

exports.html = function(req, res, files, next, dir, showUp, icons, stats){
  fs.readFile(__dirname + '/../public/directory.html', 'utf8', function(err, str){
    if (err) return next(err);
    fs.readFile(__dirname + '/../public/style.css', 'utf8', function(err, style){
      if (err) return next(err);
      if (showUp) {
        files.unshift('..');
        if(stats) stats.unshift({ name: '..' });
      }
      str = str
        .replace('{style}', style)
        .replace('{files}', html(files, dir, icons, stats))
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
  files = files.join('\n') + '\n';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', files.length);
  res.end(files);
};

/**
 * Sorting
 */
exports.sortMethods = {};

exports.sortMethods.alphabetical = function(a, b) {
  return a < b ? -1 : 1;
};

exports.sortMethods.alphaDirFirst = function(a, b) {
  var ca = (a.isDirectory() ? 0 : 1) + a.name;
  var cb = (b.isDirectory() ? 0 : 1) + b.name;
  return ca < cb ? -1 : 1;
};
exports.sortMethods.alphaDirFirst.needStat = true;

/**
 * Map html `dir`, returning a linked path.
 */

function htmlPath(dir) {
  var curr = [];
  return dir.split('/').map(function(part){
    curr.push(part);
    return part ? '<a href="' + curr.join('/') + '">' + part + '</a>' : '';
  }).join(' / ');
}

/**
 * Map html `files`, returning an html unordered list.
 */

function html(files, dir, useIcons, stats) {
  var sb = [];
  sb.push('<ul id="files">\n');
  for(var i = 0, l = files.length; i < l; i++) {
    var file = files[i]
      , icon = ''
      , classes = [];

    if (useIcons && '..' != file) {
      icon = icons[extname(file)] || icons.default;
      if (stats && stats[i].isDirectory && stats[i].isDirectory())
        icon = icons.directory;
      icon = '<img src="data:image/png;base64,' + load(icon) + '" />';
      classes.push('icon');
    }

    sb.push('<li><a href="'
      , join(dir, file)
      , '" class="'
      , classes.join(' '), '"'
      , ' title="', file, '">'
      , icon + file + '</a></li>\n');
  }
  sb.push('</ul>');
  return sb.join('');
}

/**
 * Load and cache the given `icon`.
 *
 * @param {String} icon
 * @return {String}
 * @api private
 */

function load(icon) {
  if (cache[icon]) return cache[icon];
  return cache[icon] = fs.readFileSync(__dirname + '/../public/icons/' + icon, 'base64');
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
    '.js': 'page_white_code_red.png'
  , '.c': 'page_white_c.png'
  , '.h': 'page_white_h.png'
  , '.cc': 'page_white_cplusplus.png'
  , '.php': 'page_white_php.png'
  , '.rb': 'page_white_ruby.png'
  , '.cpp': 'page_white_cplusplus.png'
  , '.swf': 'page_white_flash.png'
  , '.pdf': 'page_white_acrobat.png'
  , 'directory': 'directory.png'
  , 'default': 'page_white.png'
};
