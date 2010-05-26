// This provider is the core functionality of node-router put in a middleware

var Buffer = require('buffer').Buffer;

var routes = [];

function addRoute(method) {
    return function (pattern, handler, format) {
        if (typeof pattern === 'string') {
            pattern = new RegExp("^" + pattern + "$");
        }
        var route = {
            method: method,
            pattern: pattern,
            handler: handler
        };
        if (format !== undefined) {
            route.format = format;
        }
        routes.push(route);
    };
}

function handleRoute(req, res, route, match) {

    match = [req, res].concat(match.slice(1));
    
    res.render = function (body) {
        var type = "text/html";
        if (typeof body !== 'string') {
            body = JSON.stringify(body);
            type = "application/json";
        }
        res.writeHead(200, {
            "Content-Type": type,
            "Content-Length": Buffer.byteLength(body)
        });
        res.end(body, "utf8");
    }
    
    function dispatch() {
        var result = route.handler.apply(null, match);
        if (result) {
            res.render(result);
        }
    }
    if (route.format) {
        var body = "";
        req.setEncoding('utf8');
        req.addListener('data', function (chunk) {
            body += chunk;
        });
        req.addListener('end', function () {
            if (route.format === 'json') {
                body = JSON.parse(body);
            }
            match.push(body);
            dispatch();
        });
        return;
    }
    dispatch();

}

module.exports = {
    setup: function (env, setup) {
        setup({
            get: addRoute("GET"),
            put: addRoute("PUT"),
            del: addRoute("DELETE"),
            post: addRoute("POST")
        });
    },
    
    handle: function (req, res, next) {
        var origReq = req,
            origRes = res;
        req = Object.create(req);
        res = Object.create(res);

        res.notFound = function (message) {
            next(origReq, origRes);
        }

        for (var i = 0, l = routes.length; i < l; i++) {
            var route = routes[i];
            if (req.method === route.method) {
                var match = req.url.pathname.match(route.pattern);
                if (match && match[0].length > 0) {
                    handleRoute(req, res, route, match, next);
                    return;
                }
            }
        }
        next(req, res);
    }
};