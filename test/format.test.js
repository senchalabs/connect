
/**
 * Module dependencies.
 */

var assert = require('assert'),
    helpers = require('./helpers'),
    connect = require('connect');

module.exports = {
    test: function(){
        var server = helpers.run(
            connect.format(),
            function(req, res, next){
                res.writeHead(200, {});
                res.end('format "' + req.format + '" url "' + req.url + '"');
            }
        );
        server.assertResponse('GET', '/', 200, 'format "undefined" url "/"', 'Test default format of undefined');
        server.assertResponse('GET', '/users.json', 200, 'format "json" url "/users"', 'Test format');
        server.assertResponse('GET', '/users.new.json', 200, 'format "json" url "/users.new"', 'Test format');
        server.assertResponse('GET', '/users/all.xml', 200, 'format "xml" url "/users/all"', 'Test multi-segment path format');
        server.assertResponse('GET', '/users.json?something=json', 200, 'format "json" url "/users?something=json"', 'Test format with querystring');
        server.assertResponse('GET', '/users.json#something', 200, 'format "json" url "/users#something"', 'Test format with fragment');
    },

    'test with route': function(){
        var server = helpers.run(connect.format());
        server.use('/products', function(req, res){
            res.writeHead(200, {});
            res.end('format "' + req.format + '" url "' + req.url + '"');
        });
        server.assertResponse('GET', '/products', 200, 'format "undefined" url "/"');
        server.assertResponse('GET', '/products/.json', 200, 'format "json" url "/"');
        server.assertResponse('GET', '/products.json', 200, 'format "json" url "/"');
    }
};