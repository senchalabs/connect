# Connect

  Connect is an extensible HTTP server framework for [node](http://nodejs.org), providing high performance "plugins" known as _middleware_.

 Connect is bundled with over _14_ commonly used middleware, including
 a logger, session support, cookie parser, and [more](http://senchalabs.github.com/connect). Be sure to view the 1.0 [documentation](http://senchalabs.github.com/connect/).

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
 
   - [limit](http://senchalabs.github.com/connect/middleware-limit.html)
   - [profiler](http://senchalabs.github.com/connect/middleware-profiler.html)
   - [responseTime](http://senchalabs.github.com/connect/middleware-responseTime.html)

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

### Charset

 The charset is not longer forced via `mime.type()` resolution, now you must explicitly assign this via `res.charset = 'utf8'` etc.

## Running Tests

first:

    $ npm install -d

then:

    $ make test

## Authors

 Below is the output from [git-summary](http://github.com/visionmedia/git-extras).

     project: connect
     commits: 1616
     files  : 168
     authors: 
      1086	Tj Holowaychuk
       298	visionmedia
       191	Tim Caswell
         8	Astro
         5	Nathan Rajlich
         4	Jakub Nešetřil
         3	Alexander Simmerl
         2	Jacques Crocker
         2	Andreas Lind Petersen
         2	Fabian Jakobs
         2	Aaron Heckmann
         2	James Campos
         1	nateps
         1	Gregory McWhirter
         1	Adam Malcontenti-Wilson
         1	Joshua Peek
         1	Jxck
         1	Eran Hammer-Lahav
         1	TJ Holowaychuk
         1	Bart Teeuwisse
         1	Aseem Kishore
         1	Guillermo Rauch
         1	Jakub Nesetril


## Node Compatibility

  Connect `< 1.0.0` is compatible with node 0.2.x


  Connect `>= 1.0.0` is compatible with node 0.4.x

## License

View the [LICENSE](https://github.com/senchalabs/connect/blob/master/LICENSE) file. The [Silk](http://www.famfamfam.com/lab/icons/silk/) icons used by the `directory` middleware created by/copyright of [FAMFAMFAM](http://www.famfamfam.com/).