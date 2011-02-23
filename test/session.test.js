
/**
 * Module dependencies.
 */

var connect = require('connect')
  , assert = require('assert')
  , should = require('should')
  , http = require('http');

var MemoryStore = connect.session.MemoryStore
  , store = new MemoryStore({ reapInterval: -1 });

var port = 9900
  , pending = 0

var app = connect.createServer(
    connect.cookieParser()
  , connect.session({ secret: 'keyboard cat', store: store })
  , function(req, res, next){
    res.end('wahoo');
  }
);

app.listen(port);

function sid(cookie) {
  return /^connect\.sid=([^;]+);/.exec(cookie)[1];
}

module.exports = {
  'test Set-Cookie': function(){
    ++pending;
    http.get({ port: port }, function(res){
      var prev = res.headers['set-cookie'];
      prev.should.match(/^connect\.sid=([^;]+); path=\/; httpOnly; expires=/);
      http.get({ port: port }, function(res){
        var curr = res.headers['set-cookie'];
        curr.should.match(/^connect\.sid=([^;]+); path=\/; httpOnly; expires=/);
        sid(prev).should.not.equal(sid(curr));
        --pending || app.close();
      });
    });
  },
  
  'test SID maintenance': function(){
    pending += 6;
    http.get({ port: port }, function(res){
      --pending;
      var prev = res.headers['set-cookie'];
      prev.should.match(/^connect\.sid=([^;]+); path=\/; httpOnly; expires=/);
      var headers = { Cookie: 'connect.sid=' + sid(prev) }
        , n = 5;

      // ensure subsequent requests maintain the SID
      while (n--) {
        http.get({ port: port, headers: headers }, function(res){
          var curr = res.headers['set-cookie'];
          curr.should.match(/^connect\.sid=([^;]+); path=\/; httpOnly; expires=/);
          sid(prev).should.equal(sid(curr));
          --pending || app.close();
        });
      }
    });
  },
  
  'test SID changing': function(){
    pending += 5;
    var sids = []
      , n = 5;

    // ensure different SIDs
    while (n--) {
      http.get({ port: port }, function(res){
        var curr = sid(res.headers['set-cookie']);
        sids.should.not.contain(curr);
        sids.push(curr);
        --pending || app.close();
      });
    }
  },
  
  'test key option': function(){
    var app = connect.createServer(
      connect.cookieParser()
      , connect.session({ secret: 'keyboard cat', store: store, key: 'sid' })
      , function(req, res, next){
        res.end('wahoo');
      }
    );

    assert.response(app,
      { url: '/' },
      { headers: {
        'Set-Cookie': /^sid=([^;]+); path=\/; httpOnly; expires=/
      }});
  },
};