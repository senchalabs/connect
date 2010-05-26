// Escape of values from native to SQL string.
function sql_escape(value) {
  if (value === null) {
    return "NULL";
  }
  if (value === true) {
    return "TRUE";
  }
  if (value === false) {
    return "FALSE";
  }
  if (value.constructor.name === 'String') {
    return "'" + value.replace("'", "''") + "'";
  }
  return value.toString();
}

// Fill in the placeholders with native values
function merge(sql, parameters) {
  if (parameters.length === 0) {
    return sql;
  }
  if (parameters.length === 1 && parameters[0].constructor.name === 'Object') {
    parameters = parameters[0];
    // Named parameters
    for (var key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        sql = sql.replace(":" + key, sql_escape(parameters[key]));
      }
    }
  } else {
    if (parameters.length === 1 && parameters[0].constructor.name === 'Array') {
      parameters = parameters[0];
    }
    // ordered parameters
    parameters.forEach(function (param) {
      sql = sql.replace("?", sql_escape(param));
    });
  }
  return sql;
}

// Converter between JS types and SQL data types
function js_to_sql(class) {
  if (class === String) {
    return 'text';
  }
  if (class === Number) {
    return 'integer';
  }
  if (class === Boolean) {
    return 'bool';
  }
  throw "Unknown type " + class;
}

// Convert a condition hash/array to a proper SQL where clause.
function condition_to_sql(condition, value) {
  var operator,
      p = condition.indexOf(' ');
  if (p === -1) {
    return condition + " = " + sql_escape(value);
  }
  operator = condition.substr(p + 1);
  condition = condition.substr(0, p);
  if (['<', '>', '=', '<=', '>=', '!=', '<>'].indexOf(operator) >= 0) {
    return condition + " " + operator + " " + sql_escape(value);
  }
  if (operator === '%') {
    return condition + " LIKE " + sql_escape(value);
  }
  sys.debug(operator);
  throw "Invalid operator " + operator;
}

// overrides needs to contain at least the following
// index_col: the name of the special index column rowid in sqlite and oid in postgres
// do_insert: function (data, keys, values, callback) 
// do_update: function (data, pairs, callback) 

function Store(conn, name, columns, overrides) {
  var key,
      types = [];

  this.name = name;
  this.conn = conn;
  
  if (overrides.types) {
    types = overrides.types;
    delete overrides.types;
  }
  
  if (columns) {
    for (key in columns) {
      if (columns.hasOwnProperty(key)) {
        types.push(key + " " + js_to_sql(columns[key]));
      }
    }
  
    conn.execute("CREATE TABLE " + name + "(" + types.join(", ") +")", function () {});
  }

  if (overrides) {
    var self = this;
    Object.keys(overrides).forEach(function (key) {
      self[key] = overrides[key];
    });
  }


}
Store.prototype = {

  get: function (id, callback) {
    this.conn.query(
      "SELECT " + this.index_col + " AS _id, * FROM " + this.name + " WHERE " + this.index_col + " = ?", id,
      function (data) {
        callback(data[0]);
      }
    );
  },
  
  find: function (conditions, row_callback, callback) {
    // row_callback is optional
    if (typeof callback === 'undefined') {
      callback = row_callback;
      row_callback = false;
    }
    var sql;
    // Shortcut if there are no conditions.
    if (conditions === undefined || conditions.length === 0) {
      return this.all(callback);
    }

    if (conditions.constructor.name !== 'Array') {
      conditions = [conditions];
    }
    
    sql = "SELECT " + this.index_col + " AS _id, * FROM " + this.name + " WHERE " +
      conditions.map(function (group) {
        var ands = [], key;
        for (key in group) {
          if (group.hasOwnProperty(key)) {
            ands.push(condition_to_sql(key, group[key]));
          }
        }
        return "(" + ands.join(" AND ") + ")";
      }).join(" OR ");
    
    if (row_callback) {
      this.conn.query(sql, row_callback, callback);
    }
    this.conn.query(sql, callback);
  },
  
  each: function (row_callback, callback) {
    return this.conn.query("SELECT " + this.index_col + " AS _id, * FROM " + this.name, row_callback, callback);
  },
  
  all: function (callback) {
    return this.conn.query("SELECT " + this.index_col + " AS _id, * FROM " + this.name, callback);
  },
  
  do_update: function (data, pairs, callback) {
    this.conn.execute("UPDATE " + this.name +
      " SET " + pairs.join(", ") +
      " WHERE " + this.index_col + " = " + sql_escape(data._id),
      function () {
        callback();
      }
    );
  },

  // Save a data object to the database.  If it already has an _id do an update.
  save: function (data, callback) {
    var keys = [], 
        values = [],
        pairs = [],
        key;
    
    if (data._id) {
      for (key in data) {
        if (data.hasOwnProperty(key) && key !== '_id') {
          pairs.push(key + " = " + sql_escape(data[key]));
        }
      }
      this.do_update(data, pairs, callback);
    } else {
      for (key in data) {
        if (data.hasOwnProperty(key)) {
          keys.push(key);
          values.push(sql_escape(data[key]));
        }
      }
      this.do_insert(data, keys, values, callback);
    }
  },

  // Remove an entry from the database and remove the _id from the data object.
  remove: function (data, callback) {
    if (typeof data === 'number') {
      data = {_id: data};
    }
    this.conn.execute("DELETE FROM " + this.name +
      " WHERE " + this.index_col + " = " + sql_escape(data._id),
      function () {
        delete data._id;
        callback()
      }
    );
  },

  nuke: function (callback) {
    this.conn.query("DELETE FROM " + this.name, callback);
  }
  
};

exports.merge = merge;
exports.Store = Store;


