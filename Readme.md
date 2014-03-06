# Connect [![build status](https://secure.travis-ci.org/senchalabs/connect.png)](http://travis-ci.org/senchalabs/connect)

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
  - [cookie-session](https://github.com/expressjs/cookie-session) - previously `cookieSession`
  - [morgan](https://github.com/expressjs/morgan) - previously `logger`
  - [cookie-parser](https://github.com/expressjs/cookie-parser) - previously `cookieParser`
  - [express-session](https://github.com/expressjs/session) - previously `session`
  - [static-favicon](https://github.com/expressjs/favicon) - previously `favicon`
  - [response-time](https://github.com/expressjs/response-time) - previously `response-time`
  - [errorhandler](https://github.com/expressjs/errorhandler) - previously `error-handler`
  - [method-override](https://github.com/expressjs/method-override) - previously `method-override`
  - [connect-timeout](https://github.com/expressjs/timeout) - previously `timeout`
  - [vhost](https://github.com/expressjs/vhost) - previously `vhost`
  - [csurf](https://github.com/expressjs/csurf) - previousy `csrf`
  - [serve-index](https://github.com/expressjs/serve-index) - previousy `directory`
  - [serve-static](https://github.com/expressjs/serve-static) - previously `static`

Most of these are exact ports of their Connect 2.x equivalents. The primary exception is `cookie-session`.

Some middleware previously included with Connect are no longer supported by the Connect/Express team, are replaced by an alternative module, or should be superceded by a better module. Use one of these alternatives intead:

  - `cookieParser`
    - [cookies](https://github.com/jed/cookies) and [keygrip](https://github.com/jed/keygrip)
  - `limit`
    - [raw-body](https://github.com/stream-utils/raw-body)
  - `multipart`
    - [connect-multiparty](https://github.com/superjoe30/connect-multiparty)
    - [connect-busboy](https://github.com/mscdex/connect-busboy)
  - `staticCache`
    - [st](https://github.com/isaacs/st)
  - `query`
    - [qs](https://github.com/visionmedia/node-querystring)

## Running Tests

```bash
npm install
make test
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
