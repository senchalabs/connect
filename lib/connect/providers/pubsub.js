/*!
 * Ext JS Connect
 * Copyright(c) 2010 Ext JS, Inc.
 * MIT Licensed
 */

// Requires body decoder

var sys = require('sys');

var cache = {};

function Subscriber(req, res) {
    var id = req.socket.remoteAddress + req.socket.remotePort;
    var me = this;
    if (cache[id]) {
        me = cache[id];
    } else {
        cache[id] = me;
    }
    me.req = req;
    me.res = res;
    if (me !== this) {
        return me;
    }
}
Subscriber.prototype  = {
    send: function send(message) {
        // Send as an array so we can later batch messages.
        this.res.simpleBody(200, [message]);
    }
};

var logic;
module.exports = {
    setup: function (env) {
        logic = this.logic;
        if (typeof logic.subscribe !== 'function'
            || typeof logic.unsubscribe !== 'function'
            || typeof logic.publish !== 'function') {
            throw new Error("Pubsub provider is missing a function");
        }
    },

    handle: function (err, req, res, next) {
        if (req.method === "GET") {
            logic.subscribe(new Subscriber(req, res));
            return;
        }
        if (req.method === "POST") {
            function callback(err, result) {
                if (err) {
                    next(err);
                    return;
                }
                res.simpleBody(200, result || req.body);
            }
            try {
                var result = logic.publish(req.body, callback);
                if (result !== undefined) {
                    callback(null, result);
                }
            } catch (err) {
                next(err);
            }
            return;
        }
        next();
    }
};