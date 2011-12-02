
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
     commits: 1914
     files  : 161
     authors: 
      1336	Tj Holowaychuk          69.8%
       298	visionmedia             15.6%
       191	Tim Caswell             10.0%
        18	TJ Holowaychuk          0.9%
        10	Ryan Olds               0.5%
         8	Astro                   0.4%
         5	Jakub Nešetřil        0.3%
         5	Nathan Rajlich          0.3%
         3	Daniel Dickison         0.2%
         3	Alexander Simmerl       0.2%
         3	Andreas Lind Petersen   0.2%
         3	David Rio Deiros        0.2%
         2	Jacques Crocker         0.1%
         2	Aaron Heckmann          0.1%
         2	Adam Malcontenti-Wilson 0.1%
         2	Fabian Jakobs           0.1%
         2	Glen Mailer             0.1%
         2	James Campos            0.1%
         1	Guillermo Rauch         0.1%
         1	Jakub Nesetril          0.1%
         1	Gregory McWhirter       0.1%
         1	Arthur Taylor           0.1%
         1	Joshua Peek             0.1%
         1	Jxck                    0.1%
         1	Marco Sanson            0.1%
         1	Michael Hemesath        0.1%
         1	Morten Siebuhr          0.1%
         1	Eran Hammer-Lahav       0.1%
         1	Craig Barnes            0.1%
         1	Samori Gorse            0.1%
         1	Cameron Howey           0.1%
         1	Bart Teeuwisse          0.1%
         1	Aseem Kishore           0.1%
         1	Tom Jensen              0.1%
         1	Trent Mick              0.1%
         1	nateps                  0.1%
         1	AJ ONeal                0.1%



## Node Compatibility

  Connect `< 1.x` is compatible with node 0.2.x


  Connect `1.x` is compatible with node 0.4.x


  Connect (_master_) `2.x` is compatible with node 0.6.x

## CLA

 [http://sencha.com/cla](http://sencha.com/cla)

## License

View the [LICENSE](https://github.com/senchalabs/connect/blob/master/LICENSE) file. The [Silk](http://www.famfamfam.com/lab/icons/silk/) icons used by the `directory` middleware created by/copyright of [FAMFAMFAM](http://www.famfamfam.com/).