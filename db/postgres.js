/*jslint bitwise: true, eqeqeq: true, immed: true, newcap: true, nomen: true, onevar: true, plusplus: true, regexp: true, undef: true, white: true, indent: 2 */
/*globals include md5 node exports */

var net = require("net"),
    sys = require("sys"),
    url = require('url');

var md5 = require('../md5'),
    Buffer = require('../buffer_extras');

var sqllib = require('./sql');

exports.DEBUG = 0;

function encoder(header) {
  header = header || "";
  var w = Buffer.makeWriter();
  w.frame = function frame() {
    var message = w.toBuffer();
    var buffer = new Buffer(message.length + 4 + header.length);
    var offset = 0;
    if (header.length > 0) {
      buffer.write(header, 'ascii', offset);
      offset += header.length;
    }
    buffer.int32Write(message.length + 4, offset);
    offset += 4;
    message.copy(buffer, offset);
    return buffer;
  }
  return w;
}

// http://www.postgresql.org/docs/8.3/static/protocol-message-formats.html
var formatter = {
  CopyData: function () {
    // TODO: implement
  },
  CopyDone: function () {
    // TODO: implement
  },
  Describe: function (name, type) {
    return (encoder('D'))
      .push.string(type)
      .push.cstring(name);
  },
  Execute: function (name, max_rows) {
    return (encoder('E'))
      .push.cstring(name)
      .push.int32(max_rows);
  },
  Flush: function () {
    return encoder('H');
  },
  FunctionCall: function () {
    // TODO: implement
  },
  Parse: function (name, query, var_types) {
    var builder = (encoder('P'))
      .push.cstring(name)
      .push.cstring(query)
      .push.int16(var_types.length);
    var_types.each(function (var_type) {
      builder.push.int32(var_type);
    });
    return builder;
  },
  PasswordMessage: function (password) {
    return (encoder('p'))
      .push.cstring(password);
  },
  Query: function (query) {
    return (encoder('Q'))
      .push.cstring(query);
  },
  SSLRequest: function () {
    return (encoder())
      .push.int32(0x4D2162F);
  },
  StartupMessage: function (options) {
    // Protocol version number 3
    return encoder()
      .push.int32(0x30000)
      .push.hash(options);
  },
  Sync: function () {
    return encoder('S');
  },
  Terminate: function () {
    return encoder('X');
  }
};

// Parse response streams from the server
function parse_response(code, buffer) {
  var input, type, args, num_fields, data, size, i;
  reader = buffer.toReader();
  args = [];
  switch (code) {
  case 'R':
    switch (reader.int32()) {
    case 0:
      type = "AuthenticationOk";
      break;
    case 2:
      type = "AuthenticationKerberosV5";
      break;
    case 3:
      type = "AuthenticationCleartextPassword";
      break;
    case 4:
      type = "AuthenticationCryptPassword";
      args = [reader.string(2)];
      break;
    case 5:
      type = "AuthenticationMD5Password";
      args = [reader.buffer(4)];
      break;
    case 6:
      type = "AuthenticationSCMCredential";
      break;
    case 7:
      type = "AuthenticationGSS";
      break;
    case 8:
      // TODO: add in AuthenticationGSSContinue
      type = "AuthenticationSSPI";
      break;
    default:
    
      break;
    }
    break;
  case 'E':
    type = "ErrorResponse";
    args = [{}];
    reader.multicstring().forEach(function (field) {
      args[0][field[0]] = field.substr(1);
    });
    break;
  case 'S':
    type = "ParameterStatus";
    args = [reader.cstring(), reader.cstring()];
    break;
  case 'K':
    type = "BackendKeyData";
    args = [reader.int32(), reader.int32()];
    break;
  case 'Z':
    type = "ReadyForQuery";
    args = [reader.string(1)];
    break;
  case 'T':
    type = "RowDescription";
    num_fields = reader.int16();
    data = [];
    for (i = 0; i < num_fields; i += 1) {
      data.push({
        field: reader.cstring(),
        table_id: reader.int32(),
        column_id: reader.int16(),
        type_id: reader.int32(),
        type_size: reader.int16(),
        type_modifier: reader.int32(),
        format_code: reader.int16()
      });
    }
    args = [data];
    break;
  case 'D':
    type = "DataRow";
    data = [];
    num_fields = reader.int16();
    for (i = 0; i < num_fields; i += 1) {
      size = reader.int32();
      if (size === -1) {
        data.push(null);
      } else {
        data.push(reader.string(size));
      }
    }
    args = [data];
    break;
  case 'C':
    type = "CommandComplete";
    args = [reader.cstring()];
    break;
  case 'N':
    type = "NoticeResponse";
    args = [{}];
    reader.multicstring().forEach(function (field) {
      args[0][field[0]] = field.substr(1);
    });
    break;
  }
  if (!type) {
    sys.debug("Unknown response " + code);  
  }
  return {type: type, args: args};
}


function Connection(args) {
  if (typeof args === 'string') {
    args = url.parse(args);
    args.database = args.pathname.substr(1);
    args.auth = args.auth.split(":");
    args.username = args.auth[0];
    args.password = args.auth[1];
  }
  var started, conn, connection, events, query_queue, row_description, query_callback, results, readyState, closeState;
  
  // Default to port 5432
  args.port = args.port || 5432;

  // Default to host 127.0.0.1
  args.hostname = args.hostname || "127.0.0.1";


  connection = net.createConnection(args.port, args.hostname);
  events = new process.EventEmitter();
  query_queue = [];
  readyState = false;
  closeState = false;
  started = false;
  conn = this;
  
  // Disable the idle timeout on the connection
  connection.setTimeout(0);

  // Sends a message to the postgres server
  function sendMessage(type, args) {
    var buffer = (formatter[type].apply(this, args)).frame();
    if (exports.DEBUG > 0) {
      sys.debug("Sending " + type + ": " + JSON.stringify(args));
      if (exports.DEBUG > 2) {
        sys.debug("->" + buffer.inspect().replace('<', '['));
      }
    }
    connection.write(buffer);
  }
  
  var queue = [];
  function checkInput() {
    if (queue.length === 0) { return; }
    var first = queue[0];
    var code = String.fromCharCode(first[0]);
    var length = first.int32Read(1) - 4;
    
    // Make sure we have a whole message, TCP comes in chunks
    if (first.length < length + 5) {
      if (queue.length > 1) {
        // Merge the first two buffers
        queue.shift();
        var b = new Buffer(first.length + queue[0].length);
        first.copy(b);
        queue[0].copy(b, first.length);
        queue[0] = b;
        return checkInput();
      } else {
        return;
      }
    }
    var message = first.slice(5, 5 + length);
    if (first.length === 5 + length) {
      queue.shift();
    } else {
      queue[0] = first.slice(length + 5, first.length);
    }

    if (exports.DEBUG > 1) {
      sys.debug("stream: " + code + " " + message.inspect());
    }
    command = parse_response(code, message);
    if (command.type) {
      if (exports.DEBUG > 0) {
        sys.debug("Received " + command.type + ": " + JSON.stringify(command.args));
      }
      command.args.unshift(command.type);
      events.emit.apply(events, command.args);
    }
    checkInput();
  }
    
  // Set up tcp client
  connection.addListener("connect", function () {
    sendMessage('StartupMessage', [{user: args.username, database: args.database}]);
  });
  connection.addListener("data", function (data) {
    if (exports.DEBUG > 2) {
      sys.debug("<-" + data.inspect());
    }
    queue.push(data);
    checkInput();
  });
  connection.addListener("end", function (data) {
    connection.end();
  });
  connection.addListener("disconnect", function (had_error) {
    if (had_error) {
      sys.debug("CONNECTION DIED WITH ERROR");
    }
  });

  // Set up callbacks to automatically do the login and other logic
  events.addListener('AuthenticationMD5Password', function (salt) {
    var result = "md5" + md5(md5(args.password + args.username) + salt.toString("binary"));
    sendMessage('PasswordMessage', [result]);
  });
  events.addListener('AuthenticationCleartextPassword', function () {
    sendMessage('PasswordMessage', [args.password]);
  });
  events.addListener('ErrorResponse', function (e) {
    conn.emit('error', e.S + ": " + e.M);
    if (e.S === 'FATAL') {
      connection.end();
    }
  });
  events.addListener('ReadyForQuery', function () {
    if (!started) {
      started = true;
      conn.emit('connection');
    }
    if (query_queue.length > 0) {
      var query = query_queue.shift();
      query_callback = query.callback;
      row_callback = query.row_callback;
      sendMessage('Query', [query.sql]);
      readyState = false;
    } else {
      if (closeState) {
        connection.end();
      } else {
        readyState = true;      
      }
    }
  });
  events.addListener("RowDescription", function (data) {
    row_description = data;
    results = [];
  });
  events.addListener("DataRow", function (data) {
    var row, i, l, description, value;
    row = {};
    l = data.length;
    for (i = 0; i < l; i += 1) {
      description = row_description[i];
      value = data[i];
      if (value !== null) {
        // TODO: investigate to see if these numbers are stable across databases or
        // if we need to dynamically pull them from the pg_types table
        switch (description.type_id) {
        case 16: // bool
          value = value === 't';
          break;
        case 20: // int8
        case 21: // int2
        case 23: // int4
          value = parseInt(value, 10);
          break;
        }
      }
      row[description.field] = value;
    }
    if (row_callback) {
      row_callback(row);
    } else {
      results.push(row);
    }
  });
  events.addListener('CommandComplete', function (data) {
    query_callback.call(this, results);
  });
  
  conn.execute = function (sql/*, *parameters*/) {
    var parameters = Array.prototype.slice.call(arguments, 1);
    var callback = parameters.pop();

    // Merge the parameters in with the sql if needed.
    sql = sqllib.merge(sql, parameters);
    
    // TODO: somehow give the query_queue a hint that this isn't query and it
    // can optimize.
    query_queue.push({sql: sql, callback: function () {
      callback();
    }});
    
    if (readyState) {
      events.emit('ReadyForQuery');
    }
    
  };

  conn.query = function query(sql/*, *parameters, row_callback*/) {
    var row_callback, parameters, callback;

    // Grab the variable length parameters and the row_callback is there is one.
    parameters = Array.prototype.slice.call(arguments, 1);
    callback = parameters.pop();
    if (typeof parameters[parameters.length - 1] === 'function') {
      row_callback = parameters.pop();
    }

    // Merge the parameters in with the sql if needed.
    if (parameters.length > 0) {
      sql = sqllib.merge(sql, parameters);
    }

    if (row_callback) {
      query_queue.push({sql: sql, row_callback: row_callback, callback: function () {
        callback();
      }});
    } else {
      query_queue.push({sql: sql, callback: function (data) {
        callback(data);
      }});
    }
    
    if (readyState) {
      events.emit('ReadyForQuery');
    }
    
  };
  
  this.end = function () {
    closeState = true;

    // Close the connection right away if there are no pending queries
    if (readyState) {
      connection.end();
    }
  };
}
Connection.prototype = new process.EventEmitter();
Connection.prototype.get_store = function (name, columns) {
  return new sqllib.Store(this, name, columns, {
    do_insert: function (data, keys, values, callback) {
      this.conn.query("INSERT INTO " +
        this.name + "(" + keys.join(", ") + ")" +
        " VALUES (" + values.join(", ") + ")" +
        " RETURNING _id",
        function (result) {
          data._id = parseInt(result[0]._id, 10);
          callback(data._id);
        }
      );
    },
    index_col: '_id',
    types: ["_id SERIAL"]
  });
};

exports.Connection = Connection;
