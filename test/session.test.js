
/**
 * Module dependencies.
 */

var connect = require('../')
  , assert = require('assert')
  , should = require('should')
  , http = require('http')
  , create = require('./common').create;

// constructors

var MemoryStore = connect.session.MemoryStore
  , Cookie = connect.session.Cookie
  , Session = connect.session.Session;

// settings

var portno = 9900;

// main test app

var app = create(
    connect.cookieParser('keyboard cat')
  , connect.session()
  , function(req, res, next){
    res.end('wahoo');
  }
);

// SID helper

function sid(res) {
  return /^connect\.sid=([^;]+);/.exec(res.headers['set-cookie'][0])[1];
}

// expires helper

function expires(res) {
  if (!res.headers['set-cookie']) throw new Error('no Set-Cookie response header field');
  return res.headers['set-cookie'][0].match(/expires=([^;]+)/)[1];
}

// proxy http.get() to buffer body

var get = http.get;
http.get = function(options, fn){
  if (!options.buffer) return get.apply(this, arguments);
  get(options, function(res){
    res.body = '';
    res.on('data', function(chunk){ res.body += chunk });
    res.on('end', function(){ fn(res); });
  });
};

module.exports = {
  'test exports': function(){
    connect.session.Session.should.be.a('function');
    connect.session.Store.should.be.a('function');
    connect.session.MemoryStore.should.be.a('function');
  },

  'test Set-Cookie': function(){
    assert.response(app, { url: '/' }, function(res) {
      var cookie = res.headers['set-cookie']
        , prev = sid(res);
      cookie.should.match(/^connect\.sid=([^;]+); path=\/; expires=/);
      assert.response(app, { url: '/' }, function(res){
        var cookie = res.headers['set-cookie'];
        cookie.should.match(/^connect\.sid=([^;]+); path=\/; expires=/);
        prev.should.not.equal(sid(res));
      });
    });
  },
  
  'test SID maintenance': function(){
    assert.response(app, { url: '/' }, function(res){
      var cookie = res.headers['set-cookie']
        , prev = sid(res);
      cookie.should.match(/^connect\.sid=([^;]+); path=\/; expires=/);
      var headers = { Cookie: 'connect.sid=' + prev }
        , n = 5;
  
      // ensure subsequent requests maintain the SID
      while (n--) {
        assert.response(app, { url: '/', headers: headers }, function(res){
          var cookie = res.headers['set-cookie'];
          cookie.should.match(/^connect\.sid=([^;]+); path=\/; expires=/);
          prev.should.equal(sid(res));
        });
      }
    });
  },
  
  'test SID changing': function(){
    var sids = []
      , n = 5;
  
    // ensure different SIDs
    while (n--) {
      assert.response(app, { url: '/'}, function(res){
        var curr = sid(res);
        sids.should.not.contain(curr);
        sids.push(curr);
      });
    }
  },
  
  'test multiple Set-Cookie headers via writeHead()': function(){
    var app = create(
        connect.cookieParser('keyboard cat')
      , connect.session({ key: 'sid' })
      , function(req, res, next){
        res.setHeader('Set-Cookie', 'foo=bar');
        res.setHeader('Set-Cookie', 'bar=baz');
        res.end('wahoo');
      }
    );
  
    assert.response(app,
      { url: '/' },
      function(res){
        var cookies = res.headers['set-cookie'];
        cookies.should.have.length(3);
        cookies[0].should.equal('foo=bar');
        cookies[1].should.equal('bar=baz');
      });
  },
  
  'test multiple Set-Cookie headers via setHeader()': function(){
    var app = create(
        connect.cookieParser('keyboard cat')
      , connect.session({ key: 'sid' })
      , function(req, res, next){
        res.setHeader('Set-Cookie', 'foo=bar');
        res.setHeader('Set-Cookie', 'bar=baz');
        res.end('wahoo');
      }
    );
  
    assert.response(app,
      { url: '/' },
      function(res){
        var cookies = res.headers['set-cookie'];
        cookies.should.have.length(3);
        cookies[0].should.equal('foo=bar');
        cookies[1].should.equal('bar=baz');
      });
  },
  
  'test key option': function(){
    var app = create(
        connect.cookieParser('keyboard cat')
      , connect.session({ key: 'sid' })
      , function(req, res, next){
        res.end('wahoo');
      }
    );
  
    assert.response(app,
      { url: '/' },
      { headers: {
        'Set-Cookie': /^sid=([^;]+); path=\/; expires=/
      }});
  },
  
  'test default maxAge': function(){
    var app = create(
        connect.cookieParser('keyboard cat')
      , connect.session()
      , function(req, res, next){
        res.end('wahoo');
      }
    );
  
    assert.response(app,
      { url: '/' },
      function(res){
        var exp = new Date(expires(res))
          , now = new Date;
  
        now.getYear().should.equal(exp.getYear());
        exp.getHours().should.not.equal(now.getHours());
      });
  },
  
  'test maxAge option': function(){
    // 1 hour
    var app = create(
        connect.cookieParser('keyboard cat')
      , connect.session({ cookie: { maxAge: 3600000 }})
      , function(req, res, next){
        res.end('wahoo');
      }
    );
  
    assert.response(app,
      { url: '/' },
      function(res){
        var exp = new Date(expires(res))
          , now = new Date;
          
        now.getYear().should.equal(exp.getYear());
        exp.getHours().should.not.equal(now.getHours());
      });
  },
  
  // 'test req.session data persistence': function(){
  //   var prev
  //     , port = ++portno
  //     , app = create(
  //       connect.cookieParser('keyboard cat')
  //     , connect.session()
  //     , function(req, res, next){
  //       req.session.user = req.session.user || { name: 'tj' };
  //       req.session.user.name += '.';
  //       req.session.lastAccess.should.not.equal(prev);  
  //       req.session.count = req.session.count || 0;
  //       var n = req.session.count++;
  //       res.end('count: ' + n + ' name: ' + req.session.user.name);
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     // 0
  //     http.get(options, function(res){
  //       options.headers = { Cookie: 'connect.sid=' + sid(res) };
  //       res.body.should.equal('count: 0 name: tj.');
  // 
  //       // 1
  //       http.get(options, function(res){
  //         res.body.should.equal('count: 1 name: tj..');
  // 
  //         // no sid
  //         delete options.headers;
  //         http.get(options, function(res){
  //           res.body.should.equal('count: 0 name: tj.');
  //           app.close();
  //         });
  //       });
  //     });
  //   });
  // },
  // 
  // 'test req.session.regenerate()': function(){
  //   var prev
  //     , port = ++portno
  //     , app = create(
  //       connect.cookieParser('keyboard cat')
  //     , connect.session()
  //     , function(req, res, next){
  //       req.session.lastAccess.should.not.equal(prev);  
  //       req.session.count = req.session.count || 0;
  //       var n = req.session.count++;
  // 
  //       switch (req.url) {
  //         case '/one':
  //           prev = req.session.id;
  //           res.end('count: ' + n);
  //           break;
  //         case '/two':
  //           req.session.id.should.not.equal(prev);
  //           res.end('count: ' + n);
  //           break;
  //         case '/regenerate':
  //           should.equal(req.session.id, prev, 'SIDs did not match before regenerate()');
  //           req.session.regenerate(function(err){
  //             should.notEqual(req.session.id, prev, 'SIDs matched after regenerate()');
  //             should.notEqual(req.sessionID, prev, 'SIDs matched after regenerate()');
  //             req.sessionID.should.equal(req.session.id);
  //             should.equal(null, err);
  //             res.end('count: ' + n);
  //           });
  //           break;
  //       }
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     // 0
  //     options.path = '/one';
  //     http.get(options, function(res){
  //       var prev = sid(res);
  //       options.headers = { Cookie: 'connect.sid=' + prev };
  //       res.body.should.equal('count: 0');
  // 
  //       // regenerated
  //       options.path = '/regenerate';
  //       http.get(options, function(res){
  //         should.notEqual(prev, sid(res), 'SID remained the same after regenerate() request');
  //         res.body.should.equal('count: 1');
  // 
  //         // 1
  //         options.path = '/two';
  //         http.get(options, function(res){
  //           res.body.should.equal('count: 0');
  //           app.close();
  //         });
  //       });
  //     });
  //   });
  // },
  // 
  // 'test req.session.destroy()': function(){
  //   var prev
  //     , port = ++portno
  //     , app = create(
  //       connect.cookieParser('keyboard cat')
  //     , connect.session()
  //     , function(req, res, next){
  //       req.session.lastAccess.should.not.equal(prev);  
  //       req.session.count = req.session.count || 0;
  //       var n = req.session.count++
  //         , sid = req.session.id;
  // 
  //       req.sessionID.should.equal(sid);
  // 
  //       switch (req.url) {
  //         case '/destroy':
  //           req.session.destroy(function(err){
  //             should.equal(null, err);
  //             should.equal(null, req.session);
  //             res.end('count: ' + n);
  //           });
  //           break;
  //       }
  // 
  //       res.end('count: ' + n);
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     // 0
  //     http.get(options, function(res){
  //       var prev = sid(res);
  //       options.headers = { Cookie: 'connect.sid=' + prev };
  //       res.body.should.equal('count: 0');
  // 
  //       // destroy
  //       options.path = '/destroy';
  //       http.get(options, function(res){
  //         res.headers.should.not.have.property('set-cookie');
  //         res.body.should.equal('count: 1');
  // 
  //         // 1
  //         options.path = '/';
  //         http.get(options, function(res){
  //           prev.should.not.equal(sid(res));
  //           res.body.should.equal('count: 0');
  //           app.close();
  //         });
  //       });
  //     });
  //   });
  // },
  // 
  // 'test req.session.cookie.expires': function(){
  //   var n = 0
  //     , port = ++portno
  //     , app = create(
  //       connect.cookieParser('keyboard cat')
  //     , connect.session({ key: 'foobar' })
  //     , function(req, res, next){
  //       if (!n++) req.session.cookie.expires = new Date(0);
  //       res.end(req.session.id);
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       var prev = res.body;
  //       options.headers = { Cookie: 'foobar=' + prev };
  //       expires(res).should.equal('Thu, 01 Jan 1970 00:00:00 GMT');
  //       http.get(options, function(res){
  //         res.body.should.not.equal(prev);
  //         http.get(options, function(res){
  //           res.body.should.not.equal(prev);
  //           app.close();
  //         });
  //       });
  //     });
  //   });
  // },
  // 
  // 'test req.session.cookie.maxAge': function(){
  //   var n = 0
  //     , port = ++portno
  //     , app = create(
  //       connect.cookieParser('keyboard cat')
  //     , connect.session({ key: 'foobar' })
  //     , function(req, res, next){
  //       if (!n++) req.session.cookie.maxAge = 0;
  //       res.end(req.session.id);
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       var prev = res.body;
  //       options.headers = { Cookie: 'foobar=' + prev };
  //       http.get(options, function(res){
  //         res.body.should.not.equal(prev);
  //         http.get(options, function(res){
  //           res.body.should.not.equal(prev);
  //           app.close();
  //         });
  //       });
  //     });
  //   });
  // },
  // 
  // 'test expiration': function(){
  //   var n = 0
  //     , port = ++portno
  //     , app = create(
  //       connect.cookieParser('keyboard cat')
  //     , connect.session({ cookie: { maxAge: 200 }})
  //     , function(req, res, next){
  //       res.end(req.session.id);
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       var prev = res.body;
  //       options.headers = { Cookie: 'connect.sid=' + prev };
  //       setTimeout(function(){
  //         http.get(options, function(res){
  //           res.body.should.not.equal(prev);
  //           app.close();
  //         });
  //       }, 300);
  //     });
  //   });
  // },
  // 
  // 'test req.session.cookie properties': function(){
  //   var port = ++portno
  //     , app = create(
  //       connect.cookieParser('foo')
  //     , connect.session({ cookie: { httpOnly: true }})
  //     , function(req, res){
  //       req.session.cookie.secure = true;
  //       req.session.cookie.httpOnly.should.be.true;
  //       res.end('wahoo');
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       res.headers.should.not.have.property('set-cookie');
  //       app.close();
  //     });
  //   });
  // },
  // 
  // 'test mutating req.session.cookie': function(){
  //   var port = ++portno
  //     , app = create(
  //       connect.cookieParser('foo')
  //     , connect.session({ cookie: { httpOnly: true, secure: true }})
  //     , function(req, res){
  //       req.session.cookie.secure = false;
  //       req.session.cookie.expires = false;
  //       res.end('wahoo');
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       var cookie = res.headers['set-cookie'][0]
  //         , prev = sid(res);
  //       cookie.should.include.string('httpOnly');
  //       cookie.should.not.include.string('secure');
  //       cookie.should.not.include.string('expires');
  //       options.headers = { Cookie: 'connect.sid=' + prev };
  //       http.get(options, function(res){
  //         var cookie = res.headers['set-cookie'][0];
  //         sid(res).should.equal(prev);
  //         cookie.should.include.string('httpOnly');
  //         cookie.should.not.include.string('secure');
  //         cookie.should.not.include.string('expires');
  //         app.close();
  //       });
  //     });
  //   });
  // },
  // 
  // 'test req.session.expires = null': function(){
  //   var port = ++portno
  //     , app = create(
  //       connect.cookieParser('foo')
  //     , connect.session({ cookie: { httpOnly: true, secure: true }})
  //     , function(req, res){
  //       req.session.cookie.secure = false;
  //       req.session.cookie.expires = null;
  //       res.end('wahoo');
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       var cookie = res.headers['set-cookie'][0]
  //         , prev = sid(res);
  //       cookie.should.include.string('httpOnly');
  //       cookie.should.not.include.string('secure');
  //       cookie.should.not.include.string('expires');
  //       options.headers = { Cookie: 'connect.sid=' + prev };
  //       http.get(options, function(res){
  //         var cookie = res.headers['set-cookie'][0];
  //         sid(res).should.equal(prev);
  //         cookie.should.include.string('httpOnly');
  //         cookie.should.not.include.string('secure');
  //         cookie.should.not.include.string('expires');
  //         app.close();
  //       });
  //     });
  //   });
  // },
  // 
  // 'test expires: null': function(){
  //   var port = ++portno
  //     , app = create(
  //       connect.cookieParser('foo')
  //     , connect.session({
  //       cookie: { expires: null, httpOnly: true }
  //     })
  //     , function(req, res){
  //       res.end('wahoo');
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       var cookie = res.headers['set-cookie'][0]
  //         , prev = sid(res);
  //       cookie.should.not.include.string('expires');
  //       options.headers = { Cookie: 'connect.sid=' + prev };
  //       http.get(options, function(res){
  //         var cookie = res.headers['set-cookie'][0];
  //         sid(res).should.equal(prev);
  //         cookie.should.not.include.string('expires');
  //         app.close();
  //       });
  //     });
  //   });
  // },
  // 
  // 'test event pausing': function(){
  //   var request
  //     , store = new MemoryStore
  //     , get = store.get;
  // 
  //   store.get = function(sid, fn){
  //     request.emit('data', 'foo');
  //     request.emit('data', 'bar');
  //     request.emit('data', 'baz');
  //     setTimeout(function(self){
  //       get.call(self, sid, fn);
  //     }, 100, this);
  //   };
  // 
  //   var port = ++portno
  //     , app = create(
  //       function(req, res, next){
  //         request = req;
  //         next();
  //       }
  //     , connect.cookieParser('keyboard cat')
  //     , connect.session({ store: store })
  //     , function(req, res, next){
  //       req.pipe(res);
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       options.headers = { Cookie: 'connect.sid=' + sid(res) };
  //       http.get(options, function(res){
  //         res.body.should.equal('foobarbaz');
  //         app.close();
  //       });
  //     });
  //   });
  // },
  // 
  // 'test Set-Cookie when secure': function(){
  //   var port = ++portno
  //     , app = create(
  //       connect.cookieParser('foo')
  //     , connect.session({ cookie: { secure: true }})
  //     , function(req, res){
  //       res.end('wahoo');
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       res.headers.should.not.have.property('set-cookie');
  //       app.close();
  //     });
  //   });
  // },
  // 
  // 'test Store#load(sid, fn)': function(){
  //   var port = ++portno
  //     , store = new MemoryStore
  //     , app = create(
  //       connect.cookieParser('foo')
  //     , connect.session({ store: store })
  //     , function(req, res){
  //       res.end('wahoo');
  //     }
  //   );
  // 
  //   app.listen(port, function(){
  //     var options = { port: port, buffer: true };
  //     http.get(options, function(res){
  //       var id = decodeURIComponent(sid(res));
  //       store.load(id, function(err, sess){
  //         should.equal(null, err);
  //         sess.should.be.an.instanceof(Session);
  //         sess.cookie.should.be.an.instanceof(Cookie);
  //         sess.foo = 'bar';
  //         var a = sess;
  //         sess.save(function(){
  //           store.load(id, function(err, sess){
  //             should.equal(null, err);
  //             sess.should.be.an.instanceof(Session);
  //             sess.cookie.should.be.an.instanceof(Cookie);
  //             sess.foo.should.equal('bar');
  //             a.lastAccess.should.equal(sess.lastAccess);
  //             app.close();
  //           });
  //         });
  //       });
  //     });
  //   });
  // },
  // 
  // 'test different UA strings': function(){
  //   var headers = {
  //     'User-Agent': 'tobi/0.5'
  //   };
  // 
  //   assert.response(app,{ url: '/', headers: headers }, function(res){
  //     var prev = sid(res);
  //     headers['Cookie'] = 'connect.sid=' + prev;
  //     headers['User-Agent'] = 'tobi/1.0';
  //     assert.response(app, { url: '/', headers: headers }, function(res){
  //       prev.should.not.equal(sid(res));
  //     });
  //   });
  // },
  // 
  // 'test chromeframe UA strings': function(){
  //   var headers = {
  //     'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; BOIE9;ENUS)'
  //   };
  // 
  //   assert.response(app, { url: '/', headers: headers }, function(res){
  //     var prev = sid(res);
  //     headers['Cookie'] = 'connect.sid=' + prev;
  //     headers['User-Agent'] = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; BOIE9;ENUS; chromeframe/12.0.742.100)';
  //     assert.response(app,  { url: '/', headers: headers }, function(res){
  //       prev.should.equal(sid(res));
  //     });
  //   });
  // },
  // 
  // 'test chromeframe sub resource request UA string': function(){
  //   var headers = {
  //   'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.18 (KHTML, like Gecko) Chrome/11.0.660.0 Safari/534.18'
  //   };
  // 
  //   assert.response(app, { url: '/', headers: headers },function(res){
  //     var prev = sid(res);
  //     headers['Cookie'] = 'connect.sid=' + prev;
  //     headers['User-Agent'] = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; chromeframe/11.0.660.0) AppleWebKit/534.18 (KHTML, like Gecko) Chrome/11.0.660.0 Safari/534.18';
  //     assert.response(app, { url: '/', headers: headers }, function(res){
  //       prev.should.equal(sid(res));
  //     });
  //   });
  // },
  // 
  // 'test chromeframe request rare token placement UA string': function(){
  //   var headers = {
  //     'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)'
  //   };
  // 
  //   assert.response(app,{ url: '/', headers: headers }, function(res){
  //     var prev = sid(res);
  //     headers['Cookie'] = 'connect.sid=' + prev;
  //     headers['User-Agent'] = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1) chromeframe/11.0.660.0';
  //     assert.response(app, { url: '/', headers: headers }, function(res) {
  //       prev.should.equal(sid(res));
  //     });
  //   });
  // },
  // 
  // 'test .ignore': function(){
  //   connect.session.ignore.should.eql(['/favicon.ico']);
  // }
};