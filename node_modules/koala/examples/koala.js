
require.paths.unshift('lib')

var sys = require('sys'),
    fs = require('fs'),
    path = require('path'),
    koala = require('koala')

var file = process.argv[2] || 'examples/example.js'
var str = fs.readFileSync(file)
var html = koala.render(path.extname(file), str)

sys.puts('<style>')
sys.puts('.comment { color: grey }')
sys.puts('.string { color: red }')
sys.puts('.regexp { color: green }')
sys.puts('.number { color: blue }')
sys.puts('.class, .this { color: #1472FF }')
sys.puts('.inst.variable, .class.variable, .global.variable { color: #0756CC }')
sys.puts('.keyword { font-weight: bold }')
sys.puts('</style>')
sys.puts('<pre>', '<code class="highlight ' + path.extname(file).substr(1) + '">')
sys.puts(html)
sys.puts('</code>', '</pre>')
