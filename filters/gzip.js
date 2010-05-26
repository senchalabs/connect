var child_process = require('child_process'),
    sys = require('sys');

module.exports = {

    handle: function (req, res, next) {
        var origRes = res;
        res = Object.create(res);

        res.writeHead = function (code, headers) {
            var type = headers["Content-Type"];
            var accept = req.headers["accept-encoding"];
            if (code === 200 && accept && accept.indexOf('gzip') >= 0
                  && type && (/(text|javascript)/).test(type)) {
                headers["Content-Encoding"] = "gzip";
                delete headers["Content-Length"];
                var child = child_process.spawn("gzip", ["-9"]);

                res.write = function (chunk, encoding) {
                    child.stdin.write(chunk, encoding);
                }

                res.end = function (chunk, encoding) {
                    if (chunk) {
                        res.write(chunk, encoding)
                    }
                    child.stdin.end();
                }

                child.stdout.addListener('data', function (chunk) {
                    origRes.write(chunk);
                });

                child.addListener("exit", function (code) {
                    origRes.end();
                });

            }

            origRes.writeHead(code, headers);
        };

        next(req, res);
    }
}