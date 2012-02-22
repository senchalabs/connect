
require.paths.unshift('lib')

var sys = require('sys'),
    fs = require('fs'),
    HTML = require('koala/formatters/html').HTML,
    JavaScript = require('koala/grammars/javascript').JavaScript,
    str = fs.readFileSync('examples/example.js'),
    times = n = 100,
    bytes = str.length
    
var start = +new Date
while (n--) HTML.render(JavaScript, str)
var duration = +new Date - start
sys.puts('rendered ' + bytes + ' bytes of JavaScript ' + times + ' times in ' + duration + ' milliseconds')