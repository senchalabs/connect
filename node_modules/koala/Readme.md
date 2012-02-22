
# Koala

Koala is a node.js syntax highlighting library.

## Features

  * Fast 
  * Pure JavaScript
  * Simple grammar definitions
  * Supported languages:
    * JavaScript
    * Ruby
    * C

## Installation

  Install the [Kiwi package manager for nodejs](http://github.com/visionmedia/kiwi)
  and run:
  
      $ kiwi install koala

## Example

  $ node examples/koala.js > yay.html && open -a Safari yay.html
  $ node examples/koala.js examples/example.rb > yay.html && open -a Safari yay.html

## Usage 

auto-detection approach:

  var sys = require('sys'),
      fs = require('fs'),
      koala = require('koala')
      
  var file = 'path/to/some.js',
  var html = koala.render(file, fs.readFileSync(file))
  sys.puts(html)
  
manual approach:

  var sys = require('sys'),
      HTML = require('koala/formatters/html').HTML,
      Ruby = require('koala/grammars/ruby').Ruby
      
  sys.puts(HTML.render(Ruby, 'a string of ruby'))
  
## Benchmarks

Extensive benchmarking and comparisons are not yet available,
however quick benchmarking on my macbook pro show the HTML formatter
can render a _1600 byte file_ of JavaScript (_65 lines_) **100 times** in
**0.5 seconds**.
  
## Testing

Koala uses [JSpec](http://jspec.info) for testing, to run
all sites simply run:

    $ make test
    
or

    $ node spec/node.js

## Contributors

  * TJ Holwaychuk (visionmedia)

## License 

(The MIT License)

Copyright (c) 2009 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.