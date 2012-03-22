# TOC
   - [app.listen()](#applisten)
   - [connect.basicAuth(user, pass)](#connectbasicauthuser-pass)
     - [when missing Authorization](#when-missing-authorization)
     - [when valid](#when-valid)
     - [when invalid](#when-invalid)
   - [connect.basicAuth(callback)](#connectbasicauthcallback)
     - [when missing Authorization](#when-missing-authorization)
     - [when valid](#when-valid)
     - [when invalid](#when-invalid)
   - [connect.basicAuth(callback) async](#connectbasicauthcallback-async)
     - [when missing Authorization](#when-missing-authorization)
     - [when valid](#when-valid)
     - [when invalid](#when-invalid)
   - [connect.bodyParser()](#connectbodyparser)
     - [with multipart/form-data](#with-multipartform-data)
   - [connect.compress()](#connectcompress)
   - [connect.cookieSession()](#connectcookiesession)
     - [req.session.cookie](#reqsessioncookie)
     - [cookie option](#cookie-option)
     - [when modified](#when-modified)
     - [when un-modified](#when-un-modified)
     - [.secure](#secure)
     - [proxy option](#proxy-option)
       - [when enabled](#when-enabled)
       - [when disabled](#when-disabled)
   - [exports](#exports)
     - [.version](#version)
     - [.middleware](#middleware)
     - [.NAME](#name)
   - [connect.json()](#connectjson)
   - [connect.limit()](#connectlimit)
     - [when Content-Length is below](#when-content-length-is-below)
     - [when Content-Length is too large](#when-content-length-is-too-large)
   - [app.use()](#appuse)
     - [with a connect app](#with-a-connect-app)
     - [with a node app](#with-a-node-app)
   - [connect.multipart()](#connectmultipart)
     - [with multipart/form-data](#with-multipartform-data)
   - [patch](#patch)
     - ["header" event](#header-event)
       - [with .setHeader()](#with-setheader)
       - [with .writeHead()](#with-writehead)
       - [with .end() only](#with-end-only)
   - [connect.query()](#connectquery)
   - [connect.responseTime()](#connectresponsetime)
   - [app](#app)
   - [connect.session()](#connectsession)
     - [proxy option](#proxy-option)
       - [when enabled](#when-enabled)
       - [when disabled](#when-disabled)
     - [key option](#key-option)
     - [when an invalid sid is given](#when-an-invalid-sid-is-given)
     - [req.session](#reqsession)
       - [.destroy()](#destroy)
       - [.regenerate()](#regenerate)
       - [.cookie](#cookie)
         - [.*](#)
         - [.secure](#secure)
         - [.maxAge](#maxage)
         - [.expires](#expires)
           - [when given a Date](#when-given-a-date)
           - [when null](#when-null)
   - [connect.static()](#connectstatic)
     - [hidden files](#hidden-files)
     - [when traversing passed root](#when-traversing-passed-root)
     - [on ENOENT](#on-enoent)
     - [Range](#range)
       - [when last-byte-pos of the range is greater than current length](#when-last-byte-pos-of-the-range-is-greater-than-current-length)
       - [when the first- byte-pos of the range is greater than the current length](#when-the-first--byte-pos-of-the-range-is-greater-than-the-current-length)
       - [when syntactically invalid](#when-syntactically-invalid)
     - [when a trailing backslash is given](#when-a-trailing-backslash-is-given)
     - [with a malformed URL](#with-a-malformed-url)
     - [on ENAMETOOLONG](#on-enametoolong)
   - [connect.staticCache()](#connectstaticcache)
   - [connect.urlencoded()](#connecturlencoded)
   - [utils.uid(len)](#utilsuidlen)
   - [utils.parseCacheControl(str)](#utilsparsecachecontrolstr)
   - [utils.parseCookie(str)](#utilsparsecookiestr)
   - [utils.serializeCookie(name, val[, options])](#utilsserializecookiename-val-options)
   - [utils.[un]sign()](#utilsunsign)
   - [utils.parseRange(len, str)](#utilsparserangelen-str)
   - [utils.mime(req)](#utilsmimereq)
   - [connect.vhost()](#connectvhost)
<a name="" />
 
<a name="applisten" />
# app.listen()
should wrap in an http.Server.

```js
var app = connect();

app.use(function(req, res){
  res.end();
});

app.listen(5555, function(){
  app
  .request('/')
  .expect(200, done);
});
```

<a name="connectbasicauthuser-pass" />
# connect.basicAuth(user, pass)
<a name="connectbasicauthuser-pass-when-missing-authorization" />
## when missing Authorization
should respond with 401 and WWW-Authenticate.

```js
app.request()
.get('/')
.end(function(res){
  res.statusCode.should.equal(401);
  res.headers['www-authenticate'].should.equal('Basic realm="Authorization Required"');
  done();
});
```

<a name="connectbasicauthuser-pass-when-valid" />
## when valid
should next().

```js
app.request()
.get('/')
.set('Authorization', 'Basic dGo6dG9iaQ==')
.end(function(res){
  res.statusCode.should.equal(200);
  res.body.should.equal('secret!');
  done();
});
```

<a name="connectbasicauthuser-pass-when-invalid" />
## when invalid
should respond with 401.

```js
app.request()
.get('/')
.set('Authorization', 'Basic dGo69iaQ==')
.end(function(res){
  res.statusCode.should.equal(401);
  res.headers['www-authenticate'].should.equal('Basic realm="Authorization Required"');
  res.body.should.equal('Unauthorized');
  done();
});
```

<a name="connectbasicauthcallback" />
# connect.basicAuth(callback)
<a name="connectbasicauthcallback-when-missing-authorization" />
## when missing Authorization
should respond with 401 and WWW-Authenticate.

```js
app.request()
.get('/')
.end(function(res){
  res.statusCode.should.equal(401);
  res.headers['www-authenticate'].should.equal('Basic realm="Authorization Required"');
  done();
});
```

<a name="connectbasicauthcallback-when-valid" />
## when valid
should next().

```js
app.request()
.get('/')
.set('Authorization', 'Basic dGo6dG9iaQ==')
.end(function(res){
  res.statusCode.should.equal(200);
  res.body.should.equal('secret!');
  done();
});
```

<a name="connectbasicauthcallback-when-invalid" />
## when invalid
should respond with 401.

```js
app.request()
.get('/')
.set('Authorization', 'Basic dGo69iaQ==')
.end(function(res){
  res.statusCode.should.equal(401);
  res.headers['www-authenticate'].should.equal('Basic realm="Authorization Required"');
  res.body.should.equal('Unauthorized');
  done();
});
```

<a name="connectbasicauthcallback-async" />
# connect.basicAuth(callback) async
<a name="connectbasicauthcallback-async-when-missing-authorization" />
## when missing Authorization
should respond with 401 and WWW-Authenticate.

```js
app.request()
.get('/')
.end(function(res){
  res.statusCode.should.equal(401);
  res.headers['www-authenticate'].should.equal('Basic realm="Authorization Required"');
  done();
});
```

<a name="connectbasicauthcallback-async-when-valid" />
## when valid
should next().

```js
app.request()
.get('/')
.set('Authorization', 'Basic dGo6dG9iaQ==')
.end(function(res){
  res.statusCode.should.equal(200);
  res.body.should.equal('secret!');
  done();
});
```

<a name="connectbasicauthcallback-async-when-invalid" />
## when invalid
should respond with 401.

```js
app.request()
.get('/')
.set('Authorization', 'Basic dGo69iaQ==')
.end(function(res){
  res.statusCode.should.equal(401);
  res.headers['www-authenticate'].should.equal('Basic realm="Authorization Required"');
  res.body.should.equal('Unauthorized');
  done();
});
```

<a name="connectbodyparser" />
# connect.bodyParser()
should default to {}.

```js
app.request()
.post('/')
.end(function(res){
  res.body.should.equal('{}');
  done();
})
```

should parse JSON.

```js
app.request()
.post('/')
.set('Content-Type', 'application/json')
.write('{"user":"tobi"}')
.end(function(res){
  res.body.should.equal('{"user":"tobi"}');
  done();
});
```

should parse x-www-form-urlencoded.

```js
app.request()
.post('/')
.set('Content-Type', 'application/x-www-form-urlencoded')
.write('user=tobi')
.end(function(res){
  res.body.should.equal('{"user":"tobi"}');
  done();
});
```

<a name="connectbodyparser-with-multipartform-data" />
## with multipart/form-data
should populate req.body.

```js
app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user"\r\n')
.write('\r\n')
.write('Tobi')
.write('\r\n--foo--')
.end(function(res){
  res.body.should.equal('{"user":"Tobi"}');
  done();
});
```

should support files.

```js
var app = connect();

app.use(connect.bodyParser());

app.use(function(req, res){
  req.body.user.should.eql({ name: 'Tobi' });
  req.files.text.path.should.not.include('.txt');
  req.files.text.constructor.name.should.equal('File');
  res.end(req.files.text.name);
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user[name]"\r\n')
.write('\r\n')
.write('Tobi')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('\r\n--foo--')
.end(function(res){
  res.body.should.equal('foo.txt');
  done();
});
```

should expose options to formidable.

```js
var app = connect();

app.use(connect.bodyParser({
  keepExtensions: true
}));

app.use(function(req, res){
  req.body.user.should.eql({ name: 'Tobi' });
  req.files.text.path.should.include('.txt');
  req.files.text.constructor.name.should.equal('File');
  res.end(req.files.text.name);
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user[name]"\r\n')
.write('\r\n')
.write('Tobi')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('\r\n--foo--')
.end(function(res){
  res.body.should.equal('foo.txt');
  done();
});
```

should work with multiple fields.

```js
app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user"\r\n')
.write('\r\n')
.write('Tobi')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="age"\r\n')
.write('\r\n')
.write('1')
.write('\r\n--foo--')
.end(function(res){
  res.body.should.equal('{"user":"Tobi","age":"1"}');
  done();
});
```

should support nesting.

```js
app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user[name][first]"\r\n')
.write('\r\n')
.write('tobi')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="user[name][last]"\r\n')
.write('\r\n')
.write('holowaychuk')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="user[age]"\r\n')
.write('\r\n')
.write('1')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="species"\r\n')
.write('\r\n')
.write('ferret')
.write('\r\n--foo--')
.end(function(res){
  var obj = JSON.parse(res.body);
  obj.user.age.should.equal('1');
  obj.user.name.should.eql({ first: 'tobi', last: 'holowaychuk' });
  obj.species.should.equal('ferret');
  done();
});
```

should support multiple files of the same name.

```js
var app = connect();

app.use(connect.bodyParser());

app.use(function(req, res){
  req.files.text.should.have.length(2);
  req.files.text[0].constructor.name.should.equal('File');
  req.files.text[1].constructor.name.should.equal('File');
  res.end();
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
.write('\r\n')
.write('some more text stuff')
.write('\r\n--foo--')
.end(function(res){
  res.statusCode.should.equal(200);
  done();
});
```

should support nested files.

```js
var app = connect();

app.use(connect.bodyParser());

app.use(function(req, res){
  Object.keys(req.files.docs).should.have.length(2);
  req.files.docs.foo.name.should.equal('foo.txt');
  req.files.docs.bar.name.should.equal('bar.txt');
  res.end();
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="docs[foo]"; filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="docs[bar]"; filename="bar.txt"\r\n')
.write('\r\n')
.write('some more text stuff')
.write('\r\n--foo--')
.end(function(res){
  res.statusCode.should.equal(200);
  done();
});
```

should next(err) on multipart failure.

```js
var app = connect();

app.use(connect.bodyParser());

app.use(function(req, res){
  res.end('whoop');
});

app.use(function(err, req, res, next){
  err.message.should.equal('parser error, 16 of 28 bytes parsed');
  res.statusCode = 500;
  res.end();
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
.write('\r\n')
.write('some more text stuff')
.write('\r\n--foo--')
.end(function(res){
  res.statusCode.should.equal(500);
  done();
});
```

<a name="connectcompress" />
# connect.compress()
should gzip files.

```js
app.request()
.get('/todo.txt')
.set('Accept-Encoding', 'gzip')
.end(function(res){
  res.body.should.not.equal('- groceries');
  done();
});
```

should set Content-Encoding.

```js
app.request()
.get('/todo.txt')
.set('Accept-Encoding', 'gzip')
.expect('Content-Encoding', 'gzip', done);
```

should support HEAD.

```js
app.request()
.head('/todo.txt')
.set('Accept-Encoding', 'gzip')
.expect('', done);
```

should support conditional GETs.

```js
app.request()
.get('/todo.txt')
.set('Accept-Encoding', 'gzip')
.end(function(res){
  var date = res.headers['last-modified'];
  app.request()
  .get('/todo.txt')
  .set('Accept-Encoding', 'gzip')
  .set('If-Modified-Since', date)
  .expect(304, done);
});
```

should set Vary.

```js
app.request()
.get('/todo.txt')
.set('Accept-Encoding', 'gzip')
.expect('Vary', 'Accept-Encoding', done);
```

should set Vary at all times.

```js
app.request()
.get('/todo.txt')
.expect('Vary', 'Accept-Encoding', done);
```

should transfer chunked.

```js
app.request()
.get('/todo.txt')
.set('Accept-Encoding', 'gzip')
.expect('Transfer-Encoding', 'chunked', done);
```

should remove Content-Length for chunked.

```js
app.request()
.get('/todo.txt')
.set('Accept-Encoding', 'gzip')
.end(function(res){
  res.headers.should.not.have.property('content-length');
  done()
});
```

<a name="connectcookiesession" />
# connect.cookieSession()
should default to a browser-session length cookie.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.cookieSession())
  .use(function(req, res, next){
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  var cookie = res.headers['set-cookie'][0];
  cookie.should.not.include('expires');
  done();
});
```

should persist json.

```js
app.use(function(req, res){
  req.session.count = req.session.count || 0;
  var n = req.session.count++;
  res.end('' + n); 
});

app.request()
.get('/')
.end(function(res){
  res.body.should.equal('0');
  app.request()
  .get('/')
  .set('Cookie', sess(res))
  .end(function(res){
    res.body.should.equal('1');
    done();
  })
})
```

should reset on null.

```js
var n = 0;

app.use(function(req, res){
  switch (n++) {
    case 0:
      req.session.name = 'tobi';
      break;
    case 1:
      req.session = null;
      break;
  }

  res.setHeader('Foo', 'bar');
  res.end('wahoo');
});

app.request()
.get('/')
.end(function(res){
  sess(res).should.not.include('expires');
  app.request()
  .get('/')
  .set('Cookie', sess(res))
  .end(function(res){
    sess(res).should.include('expires=Thu, 01 Jan 1970 00:00:00 GMT');
    done();
  });
})
```

<a name="connectcookiesession-reqsessioncookie" />
## req.session.cookie
should be a Cookie.

```js
app.use(function(req, res){
  req.session.cookie.constructor.name.should.equal('Cookie');
  res.end();
});

app.request()
.get('/')
.end(function(res){
  var cookie = sess(res);
  cookie.should.include('path=/');
  cookie.should.include('httpOnly');
  done();
})
```

should manipulate the cookie.

```js
app.use(function(req, res){
  req.session.cookie.path = '/admin';
  req.session.cookie.httpOnly = false;
  res.end();
});

app.request()
.get('/')
.end(function(res){
  var cookie = sess(res);
  cookie.should.include('path=/admin');
  cookie.should.not.include('httpOnly');
  done();
})
```

<a name="connectcookiesession-cookie-option" />
## cookie option
should override defaults.

```js
var app = connect();
app.use(connect.cookieParser('some secret'));
app.use(connect.cookieSession({ cookie: { httpOnly: false }}));

app.use(function(req, res){
  res.end();
});

app.request()
.get('/')
.end(function(res){
  var cookie = sess(res);
  cookie.should.include('path=/');
  cookie.should.not.include('httpOnly');
  done();
})
```

<a name="connectcookiesession-when-modified" />
## when modified
should set-cookie.

```js
var n = 0;
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.cookieSession())
  .use(function(req, res, next){
    req.session.foo = ++n;
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  res.headers.should.have.property('set-cookie');

  app.request()
  .get('/')
  .set('Cookie', sess(res))
  .end(function(res){
    res.headers.should.have.property('set-cookie');
    done();
  });
});
```

<a name="connectcookiesession-when-un-modified" />
## when un-modified
should set-cookie only the initial time.

```js
var modify;

var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.cookieSession())
  .use(function(req, res, next){
    if (modify) req.session.foo = 'bar';
    res.end();
});

app.request()
.get('/')
.end(function(res){
  res.headers.should.have.property('set-cookie');
  var cookie = sess(res);

  app.request()
  .get('/')
  .set('Cookie', cookie)
  .end(function(res){
    res.headers.should.not.have.property('set-cookie');

    app.request()
    .get('/')
    .set('Cookie', cookie)
    .end(function(res){
      res.headers.should.not.have.property('set-cookie');
      modify = true;

      app.request()
      .get('/')
      .set('Cookie', cookie)
      .end(function(res){
        res.headers.should.have.property('set-cookie');
        done();
      });
    });
  });
});
```

<a name="connectcookiesession-secure" />
## .secure
should not set-cookie when insecure.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.cookieSession())
  .use(function(req, res, next){
    req.session.cookie.secure = true;
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  res.headers.should.not.have.property('set-cookie');
  done();
});
```

<a name="connectcookiesession-proxy-option" />
## proxy option
<a name="connectcookiesession-proxy-option-when-enabled" />
### when enabled
should trust X-Forwarded-Proto.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.cookieSession({ proxy: true, cookie: { secure: true }}))
  .use(respond);
  
app.request()
.get('/')
.set('X-Forwarded-Proto', 'https')
.end(function(res){
  res.headers.should.have.property('set-cookie');
  done();
});
```

<a name="connectcookiesession-proxy-option-when-disabled" />
### when disabled
should not trust X-Forwarded-Proto.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.cookieSession({ cookie: { secure: true }}))
  .use(respond);
  
app.request()
.get('/')
.set('X-Forwarded-Proto', 'https')
.end(function(res){
  res.headers.should.not.have.property('set-cookie');
  done();
});
```

<a name="exports" />
# exports
<a name="exports-version" />
## .version
should be a string.

```js
connect.version.should.be.a('string');
```

<a name="exports-middleware" />
## .middleware
should lazy-load middleware.

```js
connect.middleware.cookieParser.should.be.a('function');
connect.middleware.bodyParser.should.be.a('function');
connect.middleware.static.should.be.a('function');
```

<a name="exports-name" />
## .NAME
should lazy-load middleware.

```js
connect.cookieParser.should.be.a('function');
connect.bodyParser.should.be.a('function');
connect.static.should.be.a('function');
```

<a name="connectjson" />
# connect.json()
should default to {}.

```js
app.request()
.post('/')
.end(function(res){
  res.body.should.equal('{}');
  done();
})
```

should ignore GET.

```js
app.request()
.get('/')
.set('Content-Type', 'application/json')
.write('{"user":"tobi"}')
.end(function(res){
  res.body.should.equal('{}');
  done();
});
```

should parse JSON.

```js
app.request()
.post('/')
.set('Content-Type', 'application/json')
.write('{"user":"tobi"}')
.end(function(res){
  res.body.should.equal('{"user":"tobi"}');
  done();
});
```

should fail gracefully.

```js
app.request()
.post('/')
.set('Content-Type', 'application/json')
.write('{"user"')
.end(function(res){
  res.body.should.equal('Unexpected end of input');
  done();
});
```

should 400 on primitives.

```js
app.request()
.post('/')
.set('Content-Type', 'application/json')
.write('"hello, tobi"')
.expect(400, done);
```

should 400 on malformed JSON.

```js
var app = connect();
app.use(connect.json());

app.use(function(req, res){
  res.end(JSON.stringify(req.body));
});

app.request()
.post('/')
.set('Content-Type', 'application/json')
.write('{"foo')
.expect(400, done);
```

<a name="connectlimit" />
# connect.limit()
<a name="connectlimit-when-content-length-is-below" />
## when Content-Length is below
should bypass limit().

```js
app.request()
.post('/')
.set('Content-Length', 500)
.expect(200, done);
```

<a name="connectlimit-when-content-length-is-too-large" />
## when Content-Length is too large
should respond with 413.

```js
app.request()
.post('/')
.set('Content-Length', 10 * 1024)
.expect(413, done);
```

<a name="appuse" />
# app.use()
<a name="appuse-with-a-connect-app" />
## with a connect app
should mount.

```js
var blog = connect();
    
blog.use(function(req, res){
  req.url.should.equal('/');
  res.end('blog');
});
    
app.use('/blog', blog);
    
app.request()
.get('/blog')
.expect('blog', done);
```

should retain req.originalUrl.

```js
var app = connect();
    
app.use('/blog', function(req, res){
  res.end(req.originalUrl);
});
    
app.request()
.get('/blog/post/1')
.expect('/blog/post/1', done);
```

should adjust req.url.

```js
var app = connect();
    
app.use('/blog', function(req, res){
  res.end(req.url);
});
    
app.request()
.get('/blog/post/1')
.expect('/post/1', done);
```

should strip trailing slash.

```js
var blog = connect();
    
blog.use(function(req, res){
  req.url.should.equal('/');
  res.end('blog');
});
    
app.use('/blog/', blog);
    
app.request()
.get('/blog')
.expect('blog', done);
```

should set .route.

```js
var blog = connect();
var admin = connect();
app.use('/blog', blog);
blog.use('/admin', admin);
app.route.should.equal('/');
blog.route.should.equal('/blog');
admin.route.should.equal('/admin');
```

<a name="appuse-with-a-node-app" />
## with a node app
should mount.

```js
var blog = http.createServer(function(req, res){
  req.url.should.equal('/');
  res.end('blog');
});
    
app.use('/blog', blog);
    
app.request()
.get('/blog')
.expect('blog', done);
```

<a name="connectmultipart" />
# connect.multipart()
should default to {}.

```js
app.request()
.post('/')
.end(function(res){
  res.body.should.equal('{}');
  done();
})
```

should ignore GET.

```js
app.request()
.get('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user"\r\n')
.write('\r\n')
.write('Tobi')
.write('\r\n--foo--')
.end(function(res){
  res.body.should.equal('{}');
  done();
});
```

<a name="connectmultipart-with-multipartform-data" />
## with multipart/form-data
should populate req.body.

```js
app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user"\r\n')
.write('\r\n')
.write('Tobi')
.write('\r\n--foo--')
.end(function(res){
  res.body.should.equal('{"user":"Tobi"}');
  done();
});
```

should support files.

```js
var app = connect();

app.use(connect.multipart());

app.use(function(req, res){
  req.body.user.should.eql({ name: 'Tobi' });
  req.files.text.path.should.not.include('.txt');
  req.files.text.constructor.name.should.equal('File');
  res.end(req.files.text.name);
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user[name]"\r\n')
.write('\r\n')
.write('Tobi')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('\r\n--foo--')
.end(function(res){
  res.body.should.equal('foo.txt');
  done();
});
```

should expose options to formidable.

```js
var app = connect();

app.use(connect.multipart({
  keepExtensions: true
}));

app.use(function(req, res){
  req.body.user.should.eql({ name: 'Tobi' });
  req.files.text.path.should.include('.txt');
  req.files.text.constructor.name.should.equal('File');
  res.end(req.files.text.name);
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user[name]"\r\n')
.write('\r\n')
.write('Tobi')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('\r\n--foo--')
.end(function(res){
  res.body.should.equal('foo.txt');
  done();
});
```

should work with multiple fields.

```js
app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user"\r\n')
.write('\r\n')
.write('Tobi')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="age"\r\n')
.write('\r\n')
.write('1')
.write('\r\n--foo--')
.end(function(res){
  res.body.should.equal('{"user":"Tobi","age":"1"}');
  done();
});
```

should support nesting.

```js
app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="user[name][first]"\r\n')
.write('\r\n')
.write('tobi')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="user[name][last]"\r\n')
.write('\r\n')
.write('holowaychuk')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="user[age]"\r\n')
.write('\r\n')
.write('1')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="species"\r\n')
.write('\r\n')
.write('ferret')
.write('\r\n--foo--')
.end(function(res){
  var obj = JSON.parse(res.body);
  obj.user.age.should.equal('1');
  obj.user.name.should.eql({ first: 'tobi', last: 'holowaychuk' });
  obj.species.should.equal('ferret');
  done();
});
```

should support multiple files of the same name.

```js
var app = connect();

app.use(connect.multipart());

app.use(function(req, res){
  req.files.text.should.have.length(2);
  req.files.text[0].constructor.name.should.equal('File');
  req.files.text[1].constructor.name.should.equal('File');
  res.end();
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="text"; filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
.write('\r\n')
.write('some more text stuff')
.write('\r\n--foo--')
.end(function(res){
  res.statusCode.should.equal(200);
  done();
});
```

should support nested files.

```js
var app = connect();

app.use(connect.multipart());

app.use(function(req, res){
  Object.keys(req.files.docs).should.have.length(2);
  req.files.docs.foo.name.should.equal('foo.txt');
  req.files.docs.bar.name.should.equal('bar.txt');
  res.end();
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-Disposition: form-data; name="docs[foo]"; filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('\r\n--foo\r\n')
.write('Content-Disposition: form-data; name="docs[bar]"; filename="bar.txt"\r\n')
.write('\r\n')
.write('some more text stuff')
.write('\r\n--foo--')
.end(function(res){
  res.statusCode.should.equal(200);
  done();
});
```

should next(err) on multipart failure.

```js
var app = connect();

app.use(connect.multipart());

app.use(function(req, res){
  res.end('whoop');
});

app.use(function(err, req, res, next){
  err.message.should.equal('parser error, 16 of 28 bytes parsed');
  res.statusCode = 500;
  res.end();
});

app.request()
.post('/')
.set('Content-Type', 'multipart/form-data; boundary=foo')
.write('--foo\r\n')
.write('Content-filename="foo.txt"\r\n')
.write('\r\n')
.write('some text here')
.write('Content-Disposition: form-data; name="text"; filename="bar.txt"\r\n')
.write('\r\n')
.write('some more text stuff')
.write('\r\n--foo--')
.end(function(res){
  res.statusCode.should.equal(500);
  done();
});
```

should default req.files to {}.

```js
var app = connect();

app.use(connect.multipart());

app.use(function(req, res){
  res.end(JSON.stringify(req.files));
});

app.request()
.post('/')
.end(function(res){
  res.body.should.equal('{}');
  done();
});
```

<a name="patch" />
# patch
<a name="patch-header-event" />
## "header" event
<a name="patch-header-event-with-setheader" />
### with .setHeader()
should be emitted.

```js
var app = connect();

app.use(function(req, res, next){
  res.on('header', function(){
    res.setHeader('bar', 'baz');
  });

  next();
});

app.use(function(req, res){
  res.setHeader('foo', 'bar');
  res.end();
})

app.request()
.get('/')
.end(function(res){
  res.should.have.header('foo', 'bar');
  res.should.have.header('bar', 'baz');
  done();
});
```

<a name="patch-header-event-with-writehead" />
### with .writeHead()
should be emitted.

```js
var app = connect();

app.use(function(req, res, next){
  res.on('header', function(){
    res.setHeader('bar', 'baz');
  });

  next();
});

app.use(function(req, res){
  res.writeHead(200, { foo: 'bar' });
  res.end();
})

app.request()
.get('/')
.end(function(res){
  res.should.have.header('foo', 'bar');
  res.should.have.header('bar', 'baz');
  done();
});
```

<a name="patch-header-event-with-end-only" />
### with .end() only
should be emitted.

```js
var app = connect();

app.use(function(req, res, next){
  res.on('header', function(){
    res.setHeader('bar', 'baz');
  });

  next();
});

app.use(function(req, res){
  res.end();
})

app.request()
.get('/')
.end(function(res){
  res.should.have.header('bar', 'baz');
  done();
});
```

<a name="connectquery" />
# connect.query()
should parse the query-string.

```js
app.request()
.get('/?user[name]=tobi')
.end(function(res){
  res.body.should.equal('{"user":{"name":"tobi"}}');
  done();
});
```

should default to {}.

```js
app.request()
.get('/')
.end(function(res){
  res.body.should.equal('{}');
  done();
});
```

<a name="connectresponsetime" />
# connect.responseTime()
should set X-Response-Time.

```js
app.request()
.get('/')
.end(function(res){
  var n = parseInt(res.headers['x-response-time']);
  n.should.be.above(20);
  done();
});
```

<a name="app" />
# app
should inherit from event emitter.

```js
var app = connect();
app.on('foo', done);
app.emit('foo');
```

should not obscure FQDNs.

```js
var app = connect();

app.use(function(req, res){
  res.end(req.url);
});

app.request()
.get('http://example.com/foo')
.expect('http://example.com/foo', done);
```

should allow old-style constructor middleware.

```js
var app = connect(
    connect.json()
  , connect.multipart()
  , connect.urlencoded());

app.stack.should.have.length(3);
```

should allow old-style .createServer().

```js
var app = connect.createServer(
    connect.json()
  , connect.multipart()
  , connect.urlencoded());

app.stack.should.have.length(3);
```

should escape the 404 response body.

```js
var app = connect();
app.request()
.get('/foo/<script>stuff</script>')
.expect('Cannot GET /foo/&lt;script&gt;stuff&lt;/script&gt;', done);
```

<a name="connectsession" />
# connect.session()
should export constructors.

```js
connect.session.Session.should.be.a('function');
connect.session.Store.should.be.a('function');
connect.session.MemoryStore.should.be.a('function');
```

should retain the sid.

```js
app.request()
.get('/')
.end(function(res){

  var id = sid(res);
  app.request()
  .get('/')
  .set('Cookie', 'connect.sid=' + id)
  .end(function(res){
    sid(res).should.equal(id);
    done();
  });
});
```

should issue separate sids.

```js
app.request()
.get('/')
.end(function(res){

  var id = sid(res);
  app.request()
  .get('/')
  .set('Cookie', 'connect.sid=' + id)
  .end(function(res){
    sid(res).should.equal(id);

    app.request()
    .get('/')
    .end(function(res){
      sid(res).should.not.equal(id);
      done();
    });
  });
});
```

<a name="connectsession-proxy-option" />
## proxy option
<a name="connectsession-proxy-option-when-enabled" />
### when enabled
should trust X-Forwarded-Proto.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ proxy: true, cookie: { secure: true, maxAge: 5 }}))
  .use(respond);

app.request()
.get('/')
.set('X-Forwarded-Proto', 'https')
.end(function(res){
  res.headers.should.have.property('set-cookie');
  done();
});
```

<a name="connectsession-proxy-option-when-disabled" />
### when disabled
should not trust X-Forwarded-Proto.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ cookie: { secure: true, maxAge: min }}))
  .use(respond);

app.request()
.get('/')
.set('X-Forwarded-Proto', 'https')
.end(function(res){
  res.headers.should.not.have.property('set-cookie');
  done();
});
```

<a name="connectsession-key-option" />
## key option
should default to "connect.sid".

```js
app.request()
.get('/')
.end(function(res){
  res.headers['set-cookie'].should.have.length(1);
  res.headers['set-cookie'][0].should.match(/^connect\.sid/);
  done();
});
```

should allow overriding.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ key: 'sid', cookie: { maxAge: min }}))
  .use(respond);

app.request()
.get('/')
.end(function(res){
  res.headers['set-cookie'].should.have.length(1);
  res.headers['set-cookie'][0].should.match(/^sid/);
  done();
});
```

<a name="connectsession-when-an-invalid-sid-is-given" />
## when an invalid sid is given
should generate a new one.

```js
app.request()
.get('/')
.set('Cookie', 'connect.sid=foobarbaz')
.end(function(res){
  sid(res).should.not.equal('foobarbaz');
  done();
});
```

<a name="connectsession-reqsession" />
## req.session
should persist.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ cookie: { maxAge: min }}))
  .use(function(req, res, next){
    req.session.count = req.session.count || 0;
    req.session.count++;
    res.end(req.session.count.toString());
  });
  
app.request()
.get('/')
.end(function(res){
  res.body.should.equal('1');

  app.request()
  .get('/')
  .set('Cookie', 'connect.sid=' + sid(res))
  .end(function(res){
    var id = sid(res);
    res.body.should.equal('2');
    done();
  });
});
```

<a name="connectsession-reqsession-destroy" />
### .destroy()
should destroy the previous session.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session())
  .use(function(req, res, next){
    req.session.destroy(function(err){
      if (err) throw err;
      assert(!req.session, 'req.session after destroy');
      res.end();
    });
  });

app.request()
.get('/')
.end(function(res){
  res.headers.should.not.have.property('set-cookie');
  done();
});
```

<a name="connectsession-reqsession-regenerate" />
### .regenerate()
should destroy/replace the previous session.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ cookie: { maxAge: min }}))
  .use(function(req, res, next){
    var id = req.session.id;
    req.session.regenerate(function(err){
      if (err) throw err;
      id.should.not.equal(req.session.id);
      res.end();
    });
  });

app.request()
.get('/')
.end(function(res){
  var id = sid(res);

  app.request()
  .get('/')
  .set('Cookie', 'connect.sid=' + id)
  .end(function(res){
    sid(res).should.not.equal(id);
    done();
  });
});
```

<a name="connectsession-reqsession-cookie" />
### .cookie
<a name="connectsession-reqsession-cookie-" />
#### .*
should serialize as parameters.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ proxy: true, cookie: { maxAge: min }}))
  .use(function(req, res, next){
    req.session.cookie.httpOnly = false;
    req.session.cookie.secure = true;
    res.end();
  });

app.request()
.get('/')
.set('X-Forwarded-Proto', 'https')
.end(function(res){
  res.headers['set-cookie'][0].should.not.include('httpOnly');
  res.headers['set-cookie'][0].should.include('secure');
  done();
});
```

should default to a browser-session length cookie.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ cookie: { path: '/admin' }}))
  .use(function(req, res, next){
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  var cookie = res.headers['set-cookie'][0];
  cookie.should.not.include('expires');
  done();
});
```

should Set-Cookie only once for browser-session cookies.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ cookie: { path: '/admin' }}))
  .use(function(req, res, next){
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  res.headers.should.have.property('set-cookie');

  app.request()
  .get('/')
  .set('Cookie', 'connect.sid=' + sid(res))
  .end(function(res){
    res.headers.should.not.have.property('set-cookie');
    done();
  })
});
```

should override defaults.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session({ cookie: { path: '/admin', httpOnly: false, secure: true, maxAge: 5000 }}))
  .use(function(req, res, next){
    req.session.cookie.secure = false;
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  var cookie = res.headers['set-cookie'][0];
  cookie.should.not.include('httpOnly');
  cookie.should.not.include('secure');
  cookie.should.include('path=/admin');
  cookie.should.include('expires');
  done();
});
```

<a name="connectsession-reqsession-cookie-secure" />
#### .secure
should not set-cookie when insecure.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session())
  .use(function(req, res, next){
    req.session.cookie.secure = true;
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  res.headers.should.not.have.property('set-cookie');
  done();
});
```

<a name="connectsession-reqsession-cookie-maxage" />
#### .maxAge
should set relative in milliseconds.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session())
  .use(function(req, res, next){
    req.session.cookie.maxAge = 2000;
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  var a = new Date(expires(res))
    , b = new Date;

  a.getYear().should.equal(b.getYear());
  a.getMonth().should.equal(b.getMonth());
  a.getDate().should.equal(b.getDate());
  // TODO: check 2s + rotate
  a.getSeconds().should.not.equal(b.getSeconds());
  done();
});
```

<a name="connectsession-reqsession-cookie-expires" />
#### .expires
<a name="connectsession-reqsession-cookie-expires-when-given-a-date" />
##### when given a Date
should set absolute.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session())
  .use(function(req, res, next){
    req.session.cookie.expires = new Date(0);
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  expires(res).should.equal('Thu, 01 Jan 1970 00:00:00 GMT');
  done();
});
```

<a name="connectsession-reqsession-cookie-expires-when-null" />
##### when null
should be a browser-session cookie.

```js
var app = connect()
  .use(connect.cookieParser('keyboard cat'))
  .use(connect.session())
  .use(function(req, res, next){
    req.session.cookie.expires = null;
    res.end();
  });

app.request()
.get('/')
.end(function(res){
  res.headers['set-cookie'][0].should.not.include('expires=');
  done();
});
```

<a name="connectstatic" />
# connect.static()
should serve static files.

```js
app.request()
.get('/todo.txt')
.expect('- groceries', done);
```

should support nesting.

```js
app.request()
.get('/users/tobi.txt')
.expect('ferret', done);
```

should set Content-Type.

```js
app.request()
.get('/todo.txt')
.expect('Content-Type', 'text/plain; charset=UTF-8', done);
```

should default max-age=0.

```js
app.request()
.get('/todo.txt')
.expect('Cache-Control', 'public, max-age=0', done);
```

should support urlencoded pathnames.

```js
app.request()
.get('/foo%20bar')
.expect('baz', done);
```

should redirect directories.

```js
app.request()
.get('/users')
.expect(301, done);
```

should support index.html.

```js
app.request()
.get('/users/')
.end(function(res){
  res.body.should.equal('<p>tobi, loki, jane</p>');
  res.headers.should.have.property('content-type', 'text/html; charset=UTF-8');
  done();
})
```

should support ../.

```js
app.request()
.get('/users/../todo.txt')
.expect('- groceries', done);
```

should support HEAD.

```js
app.request()
.head('/todo.txt')
.expect('', done);
```

<a name="connectstatic-hidden-files" />
## hidden files
should be ignored by default.

```js
app.request()
.get('/.hidden')
.expect(404, done);
```

should be served when hidden: true is given.

```js
var app = connect();

app.use(connect.static(fixtures, { hidden: true }));

app.request()
.get('/.hidden')
.expect('I am hidden', done);
```

<a name="connectstatic-when-traversing-passed-root" />
## when traversing passed root
should respond with 403 Forbidden.

```js
app.request()
.get('/users/../../todo.txt')
.expect(403, done);
```

should catch urlencoded ../.

```js
app.request()
.get('/users/%2e%2e/%2e%2e/todo.txt')
.expect(403, done);
```

<a name="connectstatic-on-enoent" />
## on ENOENT
should next().

```js
app.request()
.get('/does-not-exist')
.expect(404, done);
```

<a name="connectstatic-range" />
## Range
should support byte ranges.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=0-4')
.expect('12345', done);
```

should be inclusive.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=0-0')
.expect('1', done);
```

should set Content-Range.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=2-5')
.expect('Content-Range', 'bytes 2-5/9', done);
```

should support -n.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=-3')
.expect('789', done);
```

should support n-.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=3-')
.expect('456789', done);
```

should respond with 206 "Partial Content".

```js
app.request()
.get('/nums')
.set('Range', 'bytes=0-4')
.expect(206, done);
```

should set Content-Length to the # of octets transferred.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=2-3')
.end(function(res){
  res.body.should.equal('34');
  res.headers['content-length'].should.equal('2');
  done();
});
```

<a name="connectstatic-range-when-last-byte-pos-of-the-range-is-greater-than-current-length" />
### when last-byte-pos of the range is greater than current length
is taken to be equal to one less than the current length.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=2-50')
.expect('Content-Range', 'bytes 2-8/9', done)
```

should adapt the Content-Length accordingly.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=2-50')
.end(function(res){
  res.headers['content-length'].should.equal('7');
  done();
});
```

<a name="connectstatic-range-when-the-first--byte-pos-of-the-range-is-greater-than-the-current-length" />
### when the first- byte-pos of the range is greater than the current length
should respond with 416.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=9-50')
.expect(416, done);
```

should include a Content-Range field with a byte-range- resp-spec of "*" and an instance-length specifying the current length.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=9-50')
.expect('Content-Range', 'bytes */9', done)
```

<a name="connectstatic-range-when-syntactically-invalid" />
### when syntactically invalid
should respond with 200 and the entire contents.

```js
app.request()
.get('/nums')
.set('Range', 'bytes=asdf')
.expect('123456789', done);
```

<a name="connectstatic-when-a-trailing-backslash-is-given" />
## when a trailing backslash is given
should 500.

```js
app.request()
.get('/todo.txt\\')
.expect(500, done);
```

<a name="connectstatic-with-a-malformed-url" />
## with a malformed URL
should respond with 400.

```js
app.request()
.get('/%')
.expect(400, done)
```

<a name="connectstatic-on-enametoolong" />
## on ENAMETOOLONG
should next().

```js
var path = Array(100).join('foobar');
  
app.request()
.get('/' + path)
.expect(404, done);
```

<a name="connectstaticcache" />
# connect.staticCache()
should set X-Cache to MISS when missed.

```js
app.request()
.get('/todo.txt')
.expect('X-Cache', 'MISS', done);
```

should set Age.

```js
app.request()
.get('/todo.txt')
.end(function(res){
  res.should.have.header('age');
  done();
});
```

should set X-Cache to MISS end-to-end.

```js
app.request()
.get('/todo.txt')
.set('Cache-Control', 'no-cache')
.expect('X-Cache', 'MISS', done);
```

should set X-Cache to HIT when hit.

```js
app.request()
.get('/todo.txt')
.expect('X-Cache', 'HIT', done);
```

should retain header fields.

```js
app.request()
.get('/todo.txt')
.end(function(res){
  res.should.have.header('content-type', 'text/plain; charset=UTF-8');
  res.should.have.header('content-length', '11');
  done();
});
```

should serve the contents on GET.

```js
app.request()
.get('/todo.txt')
.expect('- groceries', done);
```

should not serve the contents on HEAD.

```js
app.request()
.head('/todo.txt')
.expect('', done);
```

should retain Content-Length on HEAD.

```js
app.request()
.head('/todo.txt')
.expect('Content-Length', '11', done);
```

should not cache private.

```js
var app = connect();
app.use(connect.staticCache());
app.use(function(req, res, next){
  res.setHeader('Cache-Control', 'private');
  next();
});
app.use(connect.static(fixtures));

app.request()
.head('/todo.txt')
.expect('X-Cache', 'MISS', done);
```

should not cache no-store.

```js
var app = connect();
app.use(connect.staticCache());
app.use(function(req, res, next){
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use(connect.static(fixtures));

app.request()
.head('/todo.txt')
.expect('X-Cache', 'MISS', done);
```

<a name="connecturlencoded" />
# connect.urlencoded()
should default to {}.

```js
app.request()
.post('/')
.end(function(res){
  res.body.should.equal('{}');
  done();
})
```

should parse x-www-form-urlencoded.

```js
app.request()
.post('/')
.set('Content-Type', 'application/x-www-form-urlencoded')
.write('user=tobi')
.end(function(res){
  res.body.should.equal('{"user":"tobi"}');
  done();
});
```

<a name="utilsuidlen" />
# utils.uid(len)
should generate a uid of the given length.

```js
var n = 20;
while (n--) utils.uid(n).should.have.length(n);
utils.uid(10).should.not.equal(utils.uid(10));
```

<a name="utilsparsecachecontrolstr" />
# utils.parseCacheControl(str)
should parse Cache-Control.

```js
var parse = utils.parseCacheControl;
parse('no-cache').should.eql({ 'no-cache': true });
parse('no-store').should.eql({ 'no-store': true });
parse('no-transform').should.eql({ 'no-transform': true });
parse('only-if-cached').should.eql({ 'only-if-cached': true });
parse('max-age=0').should.eql({ 'max-age': 0 });
parse('max-age=60').should.eql({ 'max-age': 60 });
parse('max-stale=60').should.eql({ 'max-stale': 60 });
parse('min-fresh=60').should.eql({ 'min-fresh': 60 });
parse('public, max-age=60').should.eql({ 'public': true, 'max-age': 60 });
parse('must-revalidate, max-age=60').should.eql({ 'must-revalidate': true, 'max-age': 60 });
```

<a name="utilsparsecookiestr" />
# utils.parseCookie(str)
should parse cookies.

```js
utils.parseCookie('foo=bar').should.eql({ foo: 'bar' });
utils.parseCookie('sid=123').should.eql({ sid: '123' });

utils.parseCookie('FOO   = bar;  baz    =  raz')
  .should.eql({ FOO: 'bar', baz: 'raz' });  

utils.parseCookie('fbs="uid=0987654321&name=Test+User"')
  .should.eql({ fbs: 'uid=0987654321&name=Test User' });

utils.parseCookie('email=tobi%2Bferret@foo.com')
  .should.eql({ email: 'tobi+ferret@foo.com' });
```

<a name="utilsserializecookiename-val-options" />
# utils.serializeCookie(name, val[, options])
should serialize cookies.

```js
utils
  .serializeCookie('foo', 'bar', { path: '/' })
  .should.equal('foo=bar; path=/');

utils
  .serializeCookie('foo', 'bar', { secure: true })
  .should.equal('foo=bar; secure');

utils
  .serializeCookie('foo', 'bar', { secure: false })
  .should.equal('foo=bar');

utils
  .serializeCookie('Foo', 'foo bar')
  .should.equal('Foo=foo%20bar');

utils.parseCookie(utils.serializeCookie('fbs', 'uid=123&name=Test User'))
  .should.eql({ fbs: 'uid=123&name=Test User' });
```

<a name="utilsunsign" />
# utils.[un]sign()
should sign & unsign values.

```js
var val = utils.sign('something', 'foo');
val.should.equal('something.8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k');

val = utils.unsign('something.8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k', 'foo');
val.should.equal('something');

// make sure cookie values with periods don't trump the signature
val = utils.sign('something.for.nothing', 'foo');
val.should.equal('something.for.nothing.s/7V7+RZexRSazB9x2sNFUyhMnrdxnnh5zmnrWZJyHA');

val = utils.unsign('something.for.nothing.s/7V7+RZexRSazB9x2sNFUyhMnrdxnnh5zmnrWZJyHA', 'foo');
val.should.equal('something.for.nothing');

// invalid secret
val = utils.unsign('something.8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k', 'something');
val.should.be.false;

// invalid value
val = utils.unsign('somethingINVALID.8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k', 'foo');
val.should.be.false;

// invalid sig
val = utils.unsign('something.INVALID8WhA0qtnmrX5qoz9Z/VgxMJ+fk24BikrI+Zqndxv54k', 'foo');
val.should.be.false;
```

<a name="utilsparserangelen-str" />
# utils.parseRange(len, str)
should parse range strings.

```js
utils.parseRange(1000, 'bytes=0-499').should.eql([{ start: 0, end: 499 }]);
utils.parseRange(1000, 'bytes=40-80').should.eql([{ start: 40, end: 80 }]);
utils.parseRange(1000, 'bytes=-500').should.eql([{ start: 500, end: 999 }]);
utils.parseRange(1000, 'bytes=-400').should.eql([{ start: 600, end: 999 }]);
utils.parseRange(1000, 'bytes=500-').should.eql([{ start: 500, end: 999 }]);
utils.parseRange(1000, 'bytes=400-').should.eql([{ start: 400, end: 999 }]);
utils.parseRange(1000, 'bytes=0-0').should.eql([{ start: 0, end: 0 }]);
utils.parseRange(1000, 'bytes=-1').should.eql([{ start: 999, end: 999 }]);
```

<a name="utilsmimereq" />
# utils.mime(req)
should return the mime-type from Content-Type.

```js
utils.mime({ headers: { 'content-type': 'text/html; charset=utf8' }})
  .should.equal('text/html');

utils.mime({ headers: { 'content-type': 'text/html; charset=utf8' }})
  .should.equal('text/html');

utils.mime({ headers: { 'content-type': 'text/html' }})
  .should.equal('text/html');
```

<a name="connectvhost" />
# connect.vhost()
should route by Host.

```js
var app = connect()
  , tobi = connect()
  , loki = connect();

app.use(connect.vhost('tobi.com', tobi));
app.use(connect.vhost('loki.com', loki));

tobi.use(function(req, res){ res.end('tobi') });
loki.use(function(req, res){ res.end('loki') });

app.request()
.get('/')
.set('Host', 'tobi.com')
.expect('tobi', done);
```

should support http.Servers.

```js
var app = connect()
  , tobi = http.createServer(function(req, res){ res.end('tobi') })
  , loki = http.createServer(function(req, res){ res.end('loki') })

app.use(connect.vhost('tobi.com', tobi));
app.use(connect.vhost('loki.com', loki));

app.request()
.get('/')
.set('Host', 'loki.com')
.expect('loki', done);
```

should support wildcards.

```js
var app = connect()
  , tobi = http.createServer(function(req, res){ res.end('tobi') })
  , loki = http.createServer(function(req, res){ res.end('loki') })

app.use(connect.vhost('*.ferrets.com', loki));
app.use(connect.vhost('tobi.ferrets.com', tobi));

app.request()
.get('/')
.set('Host', 'loki.ferrets.com')
.expect('loki', done);
```

should 404 unless matched.

```js
var app = connect()
  , tobi = http.createServer(function(req, res){ res.end('tobi') })
  , loki = http.createServer(function(req, res){ res.end('loki') })

app.use(connect.vhost('tobi.com', tobi));
app.use(connect.vhost('loki.com', loki));

app.request()
.get('/')
.set('Host', 'ferrets.com')
.expect(404, done);
```

