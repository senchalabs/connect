# Connect [![Build Status](https://travis-ci.org/senchalabs/connect.svg?branch=master)](https://travis-ci.org/senchalabs/connect) [![NPM version](https://badge.fury.io/js/connect.svg)](http://badge.fury.io/js/connect)

  Connect is an extensible HTTP server framework for [node](http://nodejs.org) using "plugins" known as _middleware_.

```js
var connect = require('connect')
  , http = require('http');

var app = connect()
  .use(require('compression')())
  .use(require('cookie-session')({
    keys: ['secret1', 'secret2']
  }))
  .use(require('body-parser')())
  .use(function(req, res){
    res.end('Hello from Connect!\n');
  });

http.createServer(app).listen(3000);
```

## Connect 3.0

Connect 3.0 is in progress in the `master` branch. The main changes in Connect are:

- Middleware will be moved to their own repositories in the [expressjs](http://github.com/expressjs) organization
- All node patches will be removed - all middleware _should_ work without Connect and with similar frameworks like [restify](https://github.com/mcavage/node-restify)
- Node `0.8` is no longer supported
- The website documentation has been removed - view the markdown readmes instead

If you would like to help maintain these middleware, please contact a [member of the expressjs team](https://github.com/orgs/expressjs/members).

## Middleware

These middleware and libraries are officially supported by the Connect/Express team:

  - [body-parser](https://github.com/expressjs/body-parser) - previous `bodyParser`, `json`, and `urlencoded`. You may also be interested in:
    - [body](https://github.com/raynos/body)
    - [co-body](https://github.com/visionmedia/co-body)
    - [raw-body](https://github.com/stream-utils/raw-body)
  - [compression](https://github.com/expressjs/compression) - previously `compress`
  - [connect-timeout](https://github.com/expressjs/timeout) - previously `timeout`
  - [cookie-parser](https://github.com/expressjs/cookie-parser) - previously `cookieParser`
  - [cookie-session](https://github.com/expressjs/cookie-session) - previously `cookieSession`
  - [csurf](https://github.com/expressjs/csurf) - previousy `csrf`
  - [errorhandler](https://github.com/expressjs/errorhandler) - previously `error-handler`
  - [express-session](https://github.com/expressjs/session) - previously `session`
  - [method-override](https://github.com/expressjs/method-override) - previously `method-override`
  - [morgan](https://github.com/expressjs/morgan) - previously `logger`
  - [response-time](https://github.com/expressjs/response-time) - previously `response-time`
  - [serve-favicon](https://github.com/expressjs/serve-favicon) - previously `favicon`
  - [serve-index](https://github.com/expressjs/serve-index) - previousy `directory`
  - [serve-static](https://github.com/expressjs/serve-static) - previously `static`
  - [vhost](https://github.com/expressjs/vhost) - previously `vhost`

Most of these are exact ports of their Connect 2.x equivalents. The primary exception is `cookie-session`.

Some middleware previously included with Connect are no longer supported by the Connect/Express team, are replaced by an alternative module, or should be superseded by a better module. Use one of these alternatives instead:

  - `cookieParser`
    - [cookies](https://github.com/jed/cookies) and [keygrip](https://github.com/jed/keygrip)
  - `limit`
    - [raw-body](https://github.com/stream-utils/raw-body)
  - `multipart`
    - [connect-multiparty](https://github.com/superjoe30/connect-multiparty)
    - [connect-busboy](https://github.com/mscdex/connect-busboy)
  - `query`
    - [qs](https://github.com/visionmedia/node-querystring)
  - `staticCache`
    - [st](https://github.com/isaacs/st)
    - [connect-static](https://github.com/andrewrk/connect-static)

Checkout [http-framework](https://github.com/Raynos/http-framework/wiki/Modules) for many other compatible middleware! 

## Running Tests

```bash
npm install
npm test
```

## Contributors

 https://github.com/senchalabs/connect/graphs/contributors

## Node Compatibility

  - Connect `< 1.x` - node `0.2`
  - Connect `1.x` - node `0.4`
  - Connect `< 2.8` - node `0.6`
  - Connect `>= 2.8 < 3` - node `0.8`
  - Connect `>= 3` - node `0.10`

## License

View the [LICENSE](https://github.com/senchalabs/connect/blob/master/LICENSE) file.
