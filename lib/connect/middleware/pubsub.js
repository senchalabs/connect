/*!
 * Ext JS Connect
 * Copyright(c) 2010 Sencha Inc.
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys');

/**
 * Subscriber cache.
 */

var cache = {};

/**
 * Initialize subscriber with the given request / response objects.
 *
 * @param  {ServerRequest} req
 * @param  {ServerResponse} res
 * @api private
 */

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
    me.queue = me.queue || [];
    me.flush();
    if (me !== this) {
        return me;
    }
}

Subscriber.prototype = {

    /**
     * Send the given message string.
     *
     * @param  {String} message
     * @api private
     */

    send: function send(message) {
        // Send as an array so we can later batch messages.
        this.queue.push(message);
        this.flush();
    },

    /**
     * Flush the message queue.
     *
     * @api private
     */

    flush: function flush() {
        if (this.res && this.queue.length > 0) {
            this.res.simpleBody(200, this.queue);
            this.res = null;
            this.queue.length = 0;
        }
    }
};

module.exports = function pubsub(logic) {

    if (typeof logic.subscribe !== 'function'
        || typeof logic.unsubscribe !== 'function'
        || typeof logic.publish !== 'function') {
        throw new Error("Pubsub provider is missing a function, requires 'subscribe', 'unsubscribe', and 'publish'");
    }

    return function pubsub(req, res, next) {
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