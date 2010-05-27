require.paths.unshift(__dirname + "/lib");

var Connect = require('connect');
var Postgres = require('postgres-pure'),
    Tmpl = require('tmpl'),
    sys = require('sys'),
    fs = require('fs');

var conn = new Postgres.Connection("postgres://tim@127.0.0.1/sousaball");
conn.addListener('error', function (err) {
    sys.error(err.stack);
})

var template_cache = {};
function load_template(template, callback) {
    if (template_cache[template]) {
        return callback(null, template_cache[template]);
    }
    fs.readFile(__dirname + "/templates/" + template + ".tmpl", function (err, buffer) {
      if (err) {
        return callback(err);
      }
      try {
           template_cache[template] = Tmpl(buffer.toString('utf8'));
      } catch (err) {
          callback(err);
          return;
      }
      callback(null, template_cache[template]);
      setTimeout(function () {
          delete template_cache[template];
      })
      
    });
}


function render_template(template, user, level, callback) {
 load_map(user, level, function (level_data) {
   var data = {
     "title": "SousaBall " + user + " - " + level,
     "user": user,
     "name": level,
     "level": level_data
   };
   load_template(template, function (err, tmpl) {
     if (err) {
       callback("Missing template: " + template);
       return;
     }
     callback(tmpl(data));
   });
 });
}

function load_map(user, level, callback) {
  conn.query("SELECT data FROM levels WHERE owner=:owner AND name=:name", {owner: user, name: level}, function (rows) {
    if (!rows.length) { 
      callback({error: "Missing level file", user: user, level: level});
      return;
    }
    var level_data = JSON.parse(rows[0].data);
    conn.query("SELECT data FROM tilesets WHERE owner=:owner AND name=:name", {owner: user, name: level_data.blockset}, function (rows) {
      if (!rows.length) { 
        callback({error: "Missing tileset", user: user, tileset: level_data.blockset});
        return;
      }
      level_data.blocks = JSON.parse(rows[0].data);
      callback(level_data);
    });
  });
}


function save_map(user, level, data, callback) {
  
  conn.query("UPDATE levels SET data=:data WHERE owner=:owner AND name=:name", {
    data: JSON.stringify(data),
    owner: user,
    name: level
  }, function () {
    callback();
  });
}


function play(req, res, user, level) {
    render_template('play', user, level, function (html) {
        res.render(html);
    });
}

function edit(req, res, user, level) {
    render_template('edit', user, level, function (html) {
        res.render(html);
    });
}

function save(req, res, user, level, data) {
 save_map(user, level, data, function () {
   res.render("Save " + user + "/" + level + ".level\n" + JSON.stringify(data));
 });
}

// Serve the App
new Connect.Server([
    {filter: "log"},
    {filter: "cache"},
    {filter: "gzip"},
    // First serve static files
    {provider: "static", param: __dirname + "/public"},
    // Then the game logic as a router endpoint
    {provider: "router", param: function (server) {
        server.get(new RegExp('^/([^/]+)/([^/]+);edit$'), edit);
        server.get(new RegExp('^/([^/]+)/([^/]+)$'), play);
        server.post(new RegExp('^/([^/]+)/([^/]+)$'), save, 'json');
    }}
]).run();
