var postgres = require('db/postgres'),
    sys = require('sys'),
    fs = require('fs');

var conn = new postgres.Connection("postgres://tim@127.0.0.1/sousaball");
conn.addListener('error', function (err) {
    sys.error(err.stack);
})


function render_template(template, user, level, callback) {
 load_map(user, level, function (level_data) {
   var data = {
     "title": "SousaBall " + user + " - " + level,
     "user": user,
     "name": level,
     "level": JSON.stringify(level_data)
   };
   fs.readFile(__dirname + "/templates/" + template + ".xhtml", function (err, buffer) {
     if (err) {
       callback("Missing template: " + template);
       return;
     }
     var text = buffer.toString('utf8');
     for (var key in data) {
       if (!data.hasOwnProperty(key)) { continue; }
       text = text.replace("#{" + key + "}", data[key]);
     }
     callback(text);
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

// Map the endpoint
module.exports = function (server) {
    server.get(new RegExp('^/([^/]+)/([^/]+);edit$'), edit);
    server.get(new RegExp('^/([^/]+)/([^/]+)$'), play);
    server.post(new RegExp('^/([^/]+)/([^/]+)$'), save, 'json');
}

