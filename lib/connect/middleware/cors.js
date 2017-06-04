
/*!
 * Ext JS Connect
 * Copyright(c) 2010 Antono Vasiljev
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./../utils'),
    url = require('url');


/**
 * Setups access for CORS requests.
 * http://www.w3.org/TR/cors/
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function corsSetup(options) {

    var corsConfig = options || [];

    return function corsHandle(req, res, next) {

        if (!req.headers.origin) next(); // spec: 5.1.1

        var origin = req.headers.origin,
            resource = url.parse(req.url).pathname,
            resourceConfig = corsConfig[resource];

        if (resourceConfig) {

            // wrap writeHead
            var writeHead = res.writeHead;
            res.writeHead = function(status, headers) {
                headers = headers || {};

                // 5.1.3
                if (resourceConfig.origins && resourceConfig.origins.indexOf(origin) != -1) {
                    headers['Access-Control-Allow-Origin'] = origin;
                }

                // 5.1.3
                if (resourceConfig.credentails) {
                    headers['Access-Control-Allow-Credentials'] = true.toString();
                }

                // 5.1.4
                if (resourceConfig.headers) {
                    headers['Access-Control-Expose-Headers'] = resourceConfig.headers.join(', ');
                }

                res.writeHead = writeHead;
                return res.writeHead(status, headers);
            }
            next();
        } else {
            next();
        }
    };
};
