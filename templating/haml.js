/*
Copyright (c) 2010 Tim Caswell <tim@extjs.com>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var Haml;

(function () {

  var matchers, self_close_tags, embedder, forceXML;

  function html_escape(text) {
    return (text + "").
      replace(/&/g, "&amp;").
      replace(/</g, "&lt;").
      replace(/>/g, "&gt;").
      replace(/\"/g, "&quot;");
  }

  function render_attribs(attribs) {
    var key, value, result = [];
    for (key in attribs) {
      if (key !== '_content' && attribs.hasOwnProperty(key)) {
        switch (attribs[key]) {
        case 'undefined':
        case 'false':
        case 'null':
        case '""':
          break;
        default:
          try {
            value = JSON.parse("[" + attribs[key] +"]")[0];
            if (value === true) {
              value = key;
            } else if (typeof value === 'string' && embedder.test(value)) {
              value = '" +\n' + parse_interpol(html_escape(value)) + ' +\n"';
            } else {
              value = html_escape(value);
            }
            result.push(" " + key + '=\\"' + value + '\\"');
          } catch (e) {
            result.push(" " + key + '=\\"" + html_escape(' + attribs[key] + ') + "\\"');
          }
        }
      }
    }
    return result.join("");
  }

  // Parse the attribute block using a state machine
  function parse_attribs(line) {
    var attributes = {},
        l = line.length,
        i, c,
        count = 1,
        quote = false,
        skip = false,
        open, close, joiner, seperator,
        pair = {
          start: 1,
          middle: null,
          end: null
        };

    if (!(l > 0 && (line.charAt(0) === '{' || line.charAt(0) === '('))) {
      return {
        _content: line[0] === ' ' ? line.substr(1, l) : line
      };
    }
    open = line.charAt(0);
    close = (open === '{') ? '}' : ')';
    joiner = (open === '{') ? ':' : '=';
    seperator = (open === '{') ? ',' : ' ';

    function process_pair() {
      if (typeof pair.start === 'number' &&
          typeof pair.middle === 'number' &&
          typeof pair.end === 'number') {
        var key = line.substr(pair.start, pair.middle - pair.start).trim(),
            value = line.substr(pair.middle + 1, pair.end - pair.middle - 1).trim();
        attributes[key] = value;
      }
      pair = {
        start: null,
        middle: null,
        end: null
      };
    }

    for (i = 1; count > 0; i += 1) {

      // If we reach the end of the line, then there is a problem
      if (i > l) {
        throw "Malformed attribute block";
      }

      c = line.charAt(i);
      if (skip) {
        skip = false;
      } else {
        if (quote) {
          if (c === '\\') {
            skip = true;
          }
          if (c === quote) {
            quote = false;
          }
        } else {
          if (c === '"' || c === "'") {
            quote = c;
          }

          if (count === 1) {
            if (c === joiner) {
              pair.middle = i;
            }
            if (c === seperator || c === close) {
              pair.end = i;
              process_pair();
              if (c === seperator) {
                pair.start = i + 1;
              }
            }
          }

          if (c === open || c === "(") {
            count += 1;
          }
          if (c === close || (count > 1 && c === ")")) {
            count -= 1;
          }
        }
      }
    }
    attributes._content = line.substr(i, line.length);
    return attributes;
  }

  // Split interpolated strings into an array of literals and code fragments.
  function parse_interpol(value) {
    var items = [],
        pos = 0,
        next = 0,
        match;
    while (true) {
      // Match up to embedded string
      next = value.substr(pos).search(embedder);
      if (next < 0) {
        if (pos < value.length) {
          items.push(JSON.stringify(value.substr(pos)));
        }
        break;
      }
      items.push(JSON.stringify(value.substr(pos, next)));
      pos += next;

      // Match embedded string
      match = value.substr(pos).match(embedder);
      next = match[0].length;
      if (next < 0) { break; }
      items.push(match[1] || match[2]);
      pos += next;
    }
    return items.filter(function (part) { return part && part.length > 0}).join(" +\n");
  }

  // Used to find embedded code in interpolated strings.
  embedder = /\#\{([^}]*)\}/;

  self_close_tags = ["meta", "img", "link", "br", "hr", "input", "area", "base"];

  // All matchers' regexps should capture leading whitespace in first capture
  // and trailing content in last capture
  matchers = [
    // html tags
    {
      regexp: /^(\s*)((?:[.#%][a-z_\-][a-z0-9_:\-]*)+)(.*)$/i,
      process: function () {
        var tag, classes, ids, attribs, content;
        tag = this.matches[2];
        classes = tag.match(/\.([a-z_\-][a-z0-9_\-]*)/gi);
        ids = tag.match(/\#([a-z_\-][a-z0-9_\-]*)/gi);
        tag = tag.match(/\%([a-z_\-][a-z0-9_:\-]*)/gi);

        // Default to <div> tag
        tag = tag ? tag[0].substr(1, tag[0].length) : 'div';

        attribs = this.matches[3];
        if (attribs) {
          attribs = parse_attribs(attribs);
          if (attribs._content) {
            this.contents.unshift(attribs._content.trim());
            delete(attribs._content);
          }
        } else {
          attribs = {};
        }

        if (classes) {
          classes = classes.map(function (klass) {
            return klass.substr(1, klass.length);
          }).join(' ');
          if (attribs['class']) {
            try {
              attribs['class'] = JSON.stringify(classes + " " + JSON.parse(attribs['class']));
            } catch (e) {
              attribs['class'] = JSON.stringify(classes + " ") + " + " + attribs['class'];
            }
          } else {
            attribs['class'] = JSON.stringify(classes);
          }
        }
        if (ids) {
          ids = ids.map(function (id) {
            return id.substr(1, id.length);
          }).join(' ');
          if (attribs.id) {
            attribs.id = JSON.stringify(ids + " ") + attribs.id;
          } else {
            attribs.id = JSON.stringify(ids);
          }
        }

        attribs = render_attribs(attribs);

        content = this.render_contents();
        if (content === '""') {
          content = '';
        }

        if (forceXML ? content.length > 0 : self_close_tags.indexOf(tag) == -1) {
          return '"<' + tag + attribs + '>"' +
            (content.length > 0 ? ' + \n' + content : "") +
            ' + \n"</' + tag + '>"';
        } else {
          return '"<' + tag + attribs + ' />"';
        }
      }
    },

    // each loops
    {
      regexp: /^(\s*)(?::for|:each)\s+(?:([a-z_][a-z_\-]*),\s*)?([a-z_][a-z_\-]*)\s+in\s+(.*)(\s*)$/i,
      process: function () {
        var ivar = this.matches[2] || '__key__', // index
            vvar = this.matches[3],              // value
            avar = this.matches[4],              // array
            rvar = '__result__';                 // results

        if (this.matches[5]) {
          this.contents.unshift(this.matches[5]);
        }
        return '(function () { ' +
          'var ' + rvar + ' = [], ' + ivar + ', ' + vvar + '; ' +
          'for (' + ivar + ' in ' + avar + ') { ' +
          'if (' + avar + '.hasOwnProperty(' + ivar + ')) { ' +
          vvar + ' = ' + avar + '[' + ivar + ']; ' +
          rvar + '.push(\n' + (this.render_contents() || "''") + '\n); ' +
          '} } return ' + rvar + '.join(""); }).call(this)';
      }
    },

    // if statements
    {
      regexp: /^(\s*):if\s+(.*)\s*$/i,
      process: function () {
        var condition = this.matches[2];
        return '(function () { ' +
          'if (' + condition + ') { ' +
          'return (\n' + (this.render_contents() || '') + '\n);' +
          '} else { return ""; } }).call(this)';
      }
    },

    // declarations
    {
      regexp: /^()!!!(?:\s*(.*))\s*$/,
      process: function () {
        var line = '';
        switch ((this.matches[2] || '').toLowerCase()) {
        case '':
          // XHTML 1.0 Transitional
          line = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
          break;
        case 'strict':
        case '1.0':
          // XHTML 1.0 Strict
          line = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
          break;
        case 'frameset':
          // XHTML 1.0 Frameset
          line = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">';
          break;
        case '5':
          // XHTML 5
          line = '<!DOCTYPE html>';
          break;
        case '1.1':
          // XHTML 1.1
          line = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">';
          break;
        case 'basic':
          // XHTML Basic 1.1
          line = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">';
          break;
        case 'mobile':
          // XHTML Mobile 1.2
          line = '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">';
          break;
        case 'xml':
          // XML
          line = "<?xml version='1.0' encoding='utf-8' ?>";
          break;
        case 'xml iso-8859-1':
          // XML iso-8859-1
          line = "<?xml version='1.0' encoding='iso-8859-1' ?>";
          break;
        }
        return JSON.stringify(line + "\n");
      }
    },

    // Embedded markdown. Needs to be added to exports externally.
    {
      regexp: /^(\s*):markdown\s*$/i,
      process: function () {
        return parse_interpol(exports.Markdown.encode(this.contents.join("\n")));
      }
    },

    // script blocks
    {
      regexp: /^(\s*):(?:java)?script\s*$/,
      process: function () {
        return parse_interpol('\n<script type="text/javascript">\n' +
          '//<![CDATA[\n' +
          this.contents.join("\n") +
          "\n//]]>\n</script>\n");
      }
    },

    // css blocks
    {
      regexp: /^(\s*):css\s*$/,
      process: function () {
        return JSON.stringify('\n<style type="text/css">\n' +
          this.contents.join("\n") +
          "\n</style>\n");
      }
    },

  ];

  function compile(lines) {
    var block = false,
        output = [];

    // If lines is a string, turn it into an array
    if (typeof lines === 'string') {
      lines = lines.trim().split("\n");
    }

    lines.forEach(function(line) {
      var match, found = false;

      // Collect all text as raw until outdent
      if (block) {
        match = block.check_indent(line);
        if (match) {
          block.contents.push(match[1] || "");
          return;
        } else {
          output.push(block.process());
          block = false;
        }
      }

      matchers.forEach(function (matcher) {
        if (!found) {
          match = matcher.regexp(line);
          if (match) {
            block = {
              contents: [],
              matches: match,
              check_indent: new RegExp("^(?:\\s*|" + match[1] + "  (.*))$"),
              process: matcher.process,
              render_contents: function () {
                return compile(this. contents);
              }
            };
            found = true;
          }
        }
      });

      // Match plain text
      if (!found) {
        output.push(function () {
          // Escaped plain text
          if (line[0] === '\\') {
            return parse_interpol(line.substr(1, line.length));
          }

          // Plain variable data
          if (line[0] === '=') {
            line = line.substr(1, line.length).trim();
            try {
              return parse_interpol(JSON.parse(line));
            } catch (e) {
              return line;
            }
          }

          // HTML escape variable data
          if (line.substr(0, 2) === "&=") {
            line = line.substr(2, line.length).trim();
            try {
              return JSON.stringify(html_escape(JSON.parse(line)));
            } catch (e2) {
              return 'html_escape(' + line + ')';
            }
          }

          // Plain text
          return parse_interpol(line);
        }());
      }

    });
    if (block) {
      output.push(block.process());
    }
    return output.filter(function (part) { return part && part.length > 0}).join(" +\n");
  };

  function optimize(js) {
    var new_js = [], buffer = [], part, end;

    function flush() {
      if (buffer.length > 0) {
        new_js.push(JSON.stringify(buffer.join("")) + end);
        buffer = [];
      }
    }
    js.split("\n").forEach(function (line) {
      part = line.match(/^(\".*\")(\s*\+\s*)?$/);
      if (!part) {
        flush();
        new_js.push(line);
        return;
      }
      end = part[2] || "";
      part = part[1];
      try {
        buffer.push(JSON.parse(part));
      } catch (e) {
        flush();
        new_js.push(line);
      }
    });
    flush();
    return new_js.join("\n");
  };

  function render(text, options) {
    options = options || {};
    text = text || "";
    var js = compile(text);
    if (options.optimize) {
      js = Haml.optimize(js);
    }
    return execute(js, options.context || Haml, options.locals);
  };

  function execute(js, self, locals) {
    return (function () {
      with(locals || {}) {
        try {
          return eval("(" + js + ")");
        } catch (e) {
          return "\n<pre class='error'>" + html_escape(e.stack) + "</pre>\n";
        }

      }
    }).call(self);
  };

  Haml = function Haml(haml, xml) {
    forceXML = xml;
    var js = optimize(compile(haml));
    return new Function("locals",
      html_escape + "\n" +
      "with(locals || {}) {\n" +
      "  try {\n" +
      "    return (" + js + ");\n" +
      "  } catch (e) {\n" +
      "    return \"\\n<pre class='error'>\" + html_escape(e.stack) + \"</pre>\\n\";\n" +
      "  }\n" +
      "}");
  }

}());

// Hook into module system
if (typeof module !== 'undefined') {
  module.exports = Haml;
}