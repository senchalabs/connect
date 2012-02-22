
// Koala - Formatters - HTML - Copyright TJ Holowaychuk <tj@vision-media.ca> (MIT Licensed)

/**
 * Module dependencies.
 */

var Formatter = require('./../formatter').Formatter

/**
 * Escapes html entities.
 *
 * @param  {string} str
 * @return {string}
 * @api private
 */

function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// --- Formatter

exports.HTML = new Formatter(function(key, val){
  return key === null 
    ? val
    : '<span class="' + key + '">' + val + '</span>'
})