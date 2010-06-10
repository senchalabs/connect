
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var parse = require('url').parse;

exports.setup = function(){
    if (!this.routes) {
        throw new Error('rest provider requires a "routes" object');
    }
};

exports.handle = function(err, req, res, next){
    var route = match(req, this.routes);
    if (route) {
        route.call(this, req, res);
    }
};

function match(req, routes) {
    var method = req.method.toLowerCase(),
        url = parse(req.url);
    if (routes = routes[method]) {
        var paths = Object.keys(routes);
        for (var i = 0, len = paths.length; i < len; ++i) {
            var path = paths[i],
                fn = routes[path];
            if (path === url.pathname) {
                return fn;
            }
        }
    }
};