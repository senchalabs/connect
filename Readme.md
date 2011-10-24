
# Connect

  Connect is an extensible HTTP server framework for [node](http://nodejs.org), providing high performance "plugins" known as _middleware_.

 Connect is bundled with over _14_ commonly used middleware, including
 a logger, session support, cookie parser, and [more](http://senchalabs.github.com/connect). Be sure to view the 1.0 [documentation](http://senchalabs.github.com/connect/).

## Middleware

  - csrf
  - basicAuth
  - bodyParser
  - cookieParser
  - directory
  - errorHandler
  - favicon
  - limit
  - logger
  - methodOverride
  - query
  - responsetime
  - session
  - static
  - staticCache
  - vhost

## Static file serving

 The benchmarks below show the `static()` middleware
 requests per second vs `static()` with the `staticCache()`
 cache layer, out performing other popular node modules,
 while maintaining more features like Range request etc.

  - static(): 2700 rps
  - node-static: 5300 rps
  - static() + staticCache(): 7500 rps

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

  Connect `< 1.x` is compatible with node 0.2.x


  Connect `1.x` is compatible with node 0.4.x and 0.6.x


  Connect `2.x` (master) will be compatible with node 0.6.x

## CLA

 [http://code.google.com/legal/individual-cla-v1.0.html](http://code.google.com/legal/individual-cla-v1.0.html)

## License

View the [LICENSE](https://github.com/senchalabs/connect/blob/master/LICENSE) file. The [Silk](http://www.famfamfam.com/lab/icons/silk/) icons used by the `directory` middleware created by/copyright of [FAMFAMFAM](http://www.famfamfam.com/).