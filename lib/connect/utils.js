
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var queryString = require('querystring'),
    crypto = require('crypto'),
    Path = require('path'),
    fs = require('fs');

/**
 * Return md5 hash of the given string and optional encoding,
 * defaulting to hex.
 *
 * @param {String} str
 * @param {String} encoding
 * @return {String}
 * @api public
 */

exports.md5 = function(str, encoding){
    return crypto.createHash('md5').update(str).digest(encoding || 'hex');
};

/**
 * Default mime type.
 */

var defaultMime = exports.defaultMime = 'application/octet-stream';

/**
 * Converts the given object to a Boolean.
 *
 * @param  {Mixed} obj
 * @return {Boolean}
 * @api public
 */

exports.toBoolean = function(obj){
    return typeof obj === 'string'
        ? /^(y(es)?|true|1)$/.test(obj)
        : !! obj;
};

/**
 * Merge object b with object a.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */

exports.merge = function(a, b){
    if (a && b) {
        var keys = Object.keys(b);
        for (var i = 0, len = keys.length; i < len; ++i) {
            a[keys[i]] = b[keys[i]];
        }
    }
    return a;
};

/**
 * Return a unique identifier.
 *
 * @return {String}
 * @api public
 */

exports.uid = function() {
    // First three digits are from the current timestamp, the rest is the full
    // 32-bit precision of Math.random()
    return (Date.now() & 0x7fff).toString(32) + (0x100000000 * Math.random()).toString(32);
};

/**
 * Parse the given cookie string into an object.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parseCookie = function(str){
    var obj = {},
        pairs = str.split(/[;,] */);
    for (var i = 0, len = pairs.length; i < len; ++i) {
        var pair = pairs[i],
            eqlIndex = pair.indexOf('='),
            key = pair.substr(0, eqlIndex).trim().toLowerCase(),
            val = pair.substr(++eqlIndex, pair.length).trim();
        // Quoted values
        if (val[0] === '"') {
            val = val.slice(1, -1);
        }
        // Only assign once
        if (obj[key] === undefined) {
            obj[key] = queryString.unescape(val, true);
        }
    }
    return obj;
};

/**
 * Serialize the given object into a cookie string.
 *
 * @param {String} name
 * @param {String} val
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.serializeCookie = function(name, val, obj){
    var pairs = [name + '=' + queryString.escape(val)],
        obj = obj || {},
        keys = Object.keys(obj);
    for (var i = 0, len = keys.length; i < len; ++i) {
        var key = keys[i],
            val = obj[key];
        if (val instanceof Date) {
            val = val.toUTCString();
        } else if (typeof val === "boolean") {
            if (val === true) {
                pairs.push(key);
            }
            continue;
        }
        pairs.push(key + '=' + val);
    }
    return pairs.join('; ');
};

/**
 * Pause events on the given `obj`.
 *
 * @param {Object} obj
 * @return {Object}
 * @api public
 */

exports.pause = function(obj){
    var events = [];
    function onData(){
        events.push(['data'].concat(toArray(arguments)));
    };
    function onEnd(){
        events.push(['end'].concat(toArray(arguments)));
    };
    obj.on('data', onData);
    obj.on('end', onEnd);
    return {
        end: function(){
            obj.removeListener('data', onData);
            obj.removeListener('end', onEnd);
        },
        resume: function(){
            for (var i = 0, len = events.length; i < len; ++i) {
                obj.emit.apply(obj, events[i]);
            }
        }
    };
};

exports.mime = {

      /**
       * Return mime type for the given path,
       * otherwise default to exports.defaultMime
       * ("application/octet-stream").
       *
       * @param {String} path
       * @return {String}
       * @api public
       */

      type: function getMime(path) {
          var index = String(path).lastIndexOf(".");
          if (index < 0) {
              return defaultMime;
          }
          var type = exports.mime.types[path.substring(index).toLowerCase()] || defaultMime;
          return (/(text|javascript)/).test(type)
            ? type + "; charset=utf-8"
            : type;
      },

      /**
       * Mime types.
       */

      types: {
          ".3gp"   : "video/3gpp",
          ".a"     : "application/octet-stream",
          ".ai"    : "application/postscript",
          ".aif"   : "audio/x-aiff",
          ".aiff"  : "audio/x-aiff",
          ".asc"   : "application/pgp-signature",
          ".asf"   : "video/x-ms-asf",
          ".asm"   : "text/x-asm",
          ".asx"   : "video/x-ms-asf",
          ".atom"  : "application/atom+xml",
          ".au"    : "audio/basic",
          ".avi"   : "video/x-msvideo",
          ".bat"   : "application/x-msdownload",
          ".bin"   : "application/octet-stream",
          ".bmp"   : "image/bmp",
          ".bz2"   : "application/x-bzip2",
          ".c"     : "text/x-c",
          ".cab"   : "application/vnd.ms-cab-compressed",
          ".cc"    : "text/x-c",
          ".chm"   : "application/vnd.ms-htmlhelp",
          ".class" : "application/octet-stream",
          ".com"   : "application/x-msdownload",
          ".conf"  : "text/plain",
          ".cpp"   : "text/x-c",
          ".crt"   : "application/x-x509-ca-cert",
          ".css"   : "text/css",
          ".csv"   : "text/csv",
          ".cxx"   : "text/x-c",
          ".deb"   : "application/x-debian-package",
          ".der"   : "application/x-x509-ca-cert",
          ".diff"  : "text/x-diff",
          ".djv"   : "image/vnd.djvu",
          ".djvu"  : "image/vnd.djvu",
          ".dll"   : "application/x-msdownload",
          ".dmg"   : "application/octet-stream",
          ".doc"   : "application/msword",
          ".dot"   : "application/msword",
          ".dtd"   : "application/xml-dtd",
          ".dvi"   : "application/x-dvi",
          ".ear"   : "application/java-archive",
          ".eml"   : "message/rfc822",
          ".eps"   : "application/postscript",
          ".exe"   : "application/x-msdownload",
          ".f"     : "text/x-fortran",
          ".f77"   : "text/x-fortran",
          ".f90"   : "text/x-fortran",
          ".flv"   : "video/x-flv",
          ".for"   : "text/x-fortran",
          ".gem"   : "application/octet-stream",
          ".gemspec" : "text/x-script.ruby",
          ".gif"   : "image/gif",
          ".gz"    : "application/x-gzip",
          ".h"     : "text/x-c",
          ".hh"    : "text/x-c",
          ".htm"   : "text/html",
          ".html"  : "text/html",
          ".ico"   : "image/vnd.microsoft.icon",
          ".ics"   : "text/calendar",
          ".ifb"   : "text/calendar",
          ".iso"   : "application/octet-stream",
          ".jar"   : "application/java-archive",
          ".java"  : "text/x-java-source",
          ".jnlp"  : "application/x-java-jnlp-file",
          ".jpeg"  : "image/jpeg",
          ".jpg"   : "image/jpeg",
          ".js"    : "application/javascript",
          ".json"  : "application/json",
          ".log"   : "text/plain",
          ".m3u"   : "audio/x-mpegurl",
          ".m4v"   : "video/mp4",
          ".man"   : "text/troff",
          ".manifest": "text/cache-manifest",
          ".mathml" : "application/mathml+xml",
          ".mbox"  : "application/mbox",
          ".mdoc"  : "text/troff",
          ".me"    : "text/troff",
          ".mid"   : "audio/midi",
          ".midi"  : "audio/midi",
          ".mime"  : "message/rfc822",
          ".mml"   : "application/mathml+xml",
          ".mng"   : "video/x-mng",
          ".mov"   : "video/quicktime",
          ".mp3"   : "audio/mpeg",
          ".mp4"   : "video/mp4",
          ".mp4v"  : "video/mp4",
          ".mpeg"  : "video/mpeg",
          ".mpg"   : "video/mpeg",
          ".ms"    : "text/troff",
          ".msi"   : "application/x-msdownload",
          ".odp"   : "application/vnd.oasis.opendocument.presentation",
          ".ods"   : "application/vnd.oasis.opendocument.spreadsheet",
          ".odt"   : "application/vnd.oasis.opendocument.text",
          ".ogg"   : "application/ogg",
          ".p"     : "text/x-pascal",
          ".pas"   : "text/x-pascal",
          ".pbm"   : "image/x-portable-bitmap",
          ".pdf"   : "application/pdf",
          ".pem"   : "application/x-x509-ca-cert",
          ".pgm"   : "image/x-portable-graymap",
          ".pgp"   : "application/pgp-encrypted",
          ".pkg"   : "application/octet-stream",
          ".pl"    : "text/x-script.perl",
          ".pm"    : "text/x-script.perl-module",
          ".png"   : "image/png",
          ".pnm"   : "image/x-portable-anymap",
          ".ppm"   : "image/x-portable-pixmap",
          ".pps"   : "application/vnd.ms-powerpoint",
          ".ppt"   : "application/vnd.ms-powerpoint",
          ".ps"    : "application/postscript",
          ".psd"   : "image/vnd.adobe.photoshop",
          ".py"    : "text/x-script.python",
          ".qt"    : "video/quicktime",
          ".ra"    : "audio/x-pn-realaudio",
          ".rake"  : "text/x-script.ruby",
          ".ram"   : "audio/x-pn-realaudio",
          ".rar"   : "application/x-rar-compressed",
          ".rb"    : "text/x-script.ruby",
          ".rdf"   : "application/rdf+xml",
          ".roff"  : "text/troff",
          ".rpm"   : "application/x-redhat-package-manager",
          ".rss"   : "application/rss+xml",
          ".rtf"   : "application/rtf",
          ".ru"    : "text/x-script.ruby",
          ".s"     : "text/x-asm",
          ".sgm"   : "text/sgml",
          ".sgml"  : "text/sgml",
          ".sh"    : "application/x-sh",
          ".sig"   : "application/pgp-signature",
          ".snd"   : "audio/basic",
          ".so"    : "application/octet-stream",
          ".svg"   : "image/svg+xml",
          ".svgz"  : "image/svg+xml",
          ".swf"   : "application/x-shockwave-flash",
          ".t"     : "text/troff",
          ".tar"   : "application/x-tar",
          ".tbz"   : "application/x-bzip-compressed-tar",
          ".tci"   : "application/x-topcloud",
          ".tcl"   : "application/x-tcl",
          ".tex"   : "application/x-tex",
          ".texi"  : "application/x-texinfo",
          ".texinfo" : "application/x-texinfo",
          ".text"  : "text/plain",
          ".tif"   : "image/tiff",
          ".tiff"  : "image/tiff",
          ".torrent" : "application/x-bittorrent",
          ".tr"    : "text/troff",
          ".ttf"   : "application/x-font-ttf",
          ".txt"   : "text/plain",
          ".vcf"   : "text/x-vcard",
          ".vcs"   : "text/x-vcalendar",
          ".vrml"  : "model/vrml",
          ".war"   : "application/java-archive",
          ".wav"   : "audio/x-wav",
          ".wma"   : "audio/x-ms-wma",
          ".wmv"   : "video/x-ms-wmv",
          ".wmx"   : "video/x-ms-wmx",
          ".wrl"   : "model/vrml",
          ".wsdl"  : "application/wsdl+xml",
          ".xbm"   : "image/x-xbitmap",
          ".xhtml"   : "application/xhtml+xml",
          ".xls"   : "application/vnd.ms-excel",
          ".xml"   : "application/xml",
          ".xpm"   : "image/x-xpixmap",
          ".xsl"   : "application/xml",
          ".xslt"  : "application/xslt+xml",
          ".yaml"  : "text/yaml",
          ".yml"   : "text/yaml",
          ".zip"   : "application/zip"
      }
};

// Works like find on unix.  Does a recursive readdir and filters by pattern.
exports.find = function find(root, pattern, callback) {

    function rfind(root, callback) {
        fs.readdir(root, function (err, files) {
            if (err) {
                callback(err);
                return;
            }
            var results = [],
                counter = 0;
            files.forEach(function (file) {
                counter++;
                function checkCounter() {
                    counter--;
                    if (counter === 0) {
                        callback(null, results);
                    }
                }
                var file = root + "/" + file;
                fs.stat(file, function (err, stat) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    if (stat.isDirectory()) {
                        rfind(file, function (err, files) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            results.push.apply(results, files);
                            checkCounter();
                        });
                        return;
                    }
                    if (pattern.test(file)) {
                        stat.path = file;
                        results.push(stat);
                    }
                    checkCounter();
                });
            });
        });
    }
    rfind(root, function (err, files) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, files.map(function (file) {
            file.path = file.path.substr(root.length);
            return file;
        }));
    });
};

/**
 * Convert array-like object to an Array.
 *
 * node-bench: "16.5 times faster than Array.prototype.slice.call()"
 *
 * @param {Object} obj
 * @return {Array}
 * @api private
 */

function toArray(obj){
    var len = obj.length,
        arr = new Array(len);
    for (var i = 0; i < len; ++i) {
        arr[i] = obj[i];
    }
    return arr;
}
