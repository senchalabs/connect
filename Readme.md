# Connect

  Connect is an extensible HTTP server framework for [node](http://nodejs.org), providing high performance "plugins" known as _middleware_.

 Connect is bundled with over _14_ commonly used middleware, including
 a logger, session support, cookie parser, and [more](http://senchalabs.github.com/connect).

## 1.0 Migration Guide

 Connect 1.0 is a near-complete rewrite of Connect, with this
 comes some changes, including some (minor) API changes,
 and removal of a few middleware, which you are welcome to
 rip out of previous versions as third-party middleware.

### Middleware Removed
 
   - `cache`  cached _everything_. This is less than ideal for dynamic apps, rendering this middleware relatively useless.
   - `conditionalGet` blanketed _all_ requests, requiring the entire response to be computed before a response could be concluded. This is extremely wasteful.
   - `staticGzip` useless. gzip / ship assets to a CDN 
   - `gzip` buggy
   - `lint` lame

### Middleware Renamed
 
   - `staticProvider` is now `static`
   - `bodyDecoder` is now `bodyParser`
   - `cookieDecoder` is now `cookieParser`

### Middleware Added
 
   - `limit`
   - `profiler`
   - `responseTime`

### connect.createServer()

  The `connect.createServer()` method is now optional, and equivalent to `connect()`. For example:
  
      connect.createServer(
          connect.logger()
        , connect.static(__dirname)
      ).listen(3000); 

is the same as:

      connect(
          connect.logger()
        , connect.static(__dirname)
      ).listen(3000);

When an options _object_ is passed as the first argument it is
assumed to be an https server:

      connect({ options here }
          connect.logger()
        , connect.static(__dirname)
      ).listen(443);

## Authors

 Below is the output from [git-summary](http://github.com/visionmedia/git-extras).

      project: connect
      commits: 1408
      files  : 100
      authors: 
        1184	Tj Holowaychuk
        191	Tim Caswell
          8	Astro
          5	Nathan Rajlich
          4	Jakub Nešetřil
          2	Aaron Heckmann
          2	Fabian Jakobs
          2	Jacques Crocker
          2	James Campos
          1	Jakub Nesetril
          1	Andreas Lind Petersen
          1	Joshua Peek
          1	Jxck
          1	Gregory McWhirter
          1	Eran Hammer-Lahav
          1	Bart Teeuwisse
          1	Guillermo Rauch

## License

(The MIT License)

Copyright (c) 2010 Sencha Inc.
Copyright (c) 2011 LearnBoost
Copyright (c) 2011 TJ Holowaychuk

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