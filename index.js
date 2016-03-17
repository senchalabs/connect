/*!
 * connect
 * 
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * Copyright(c) 2016 Maksim Chetverikov
 *
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

const debug = require('debug')('handler:dispatcher');
const EventEmitter = require('events').EventEmitter;
const finalhandler = require('finalhandler');
const http = require('http');
const merge = require('utils-merge');
const parseUrl = require('parseurl');

class Connect extends EventEmitter {
  constructor() {
    super();
    this.route = '/';
    this.stack = [];
  }

  /**
   * Utilize the given middleware `handle` to the given `route`,
   * defaulting to _/_. This "route" is the mount-point for the
   * middleware, when given a value other than _/_ the middleware
   * is only effective when that segment is present in the request's
   * pathname.
   *
   * For example if we were to mount a function at _/admin_, it would
   * be invoked on _/admin_, and _/admin/settings_, however it would
   * not be invoked for _/_, or _/posts_.
   *
   * @param {String|Function|Server} route, callback or server
   * @param {Function|Server} callback or server
   * @return {Server} for chaining
   * @public
   */
  use(route, callback) {
    let handle = callback;
    let path = route;

    // default route to '/'
    if (typeof route !== 'string') {
      handle = route;
      path = '/';
    }

    // wrap sub-apps
    if (typeof handle.handle === 'function') {
      const server = handle;
      server.route = path;
      handle = function(req, res, next) {
        server.handle(req, res, next);
      };
    }

    // wrap vanilla http.Servers
    if (handle instanceof http.Server) {
      handle = handle.listeners('request')[0];
    }

    // strip trailing slash
    if (path[path.length - 1] === '/') {
      path = path.slice(0, -1);
    }

    // add the middleware
    debug(`use ${path || '/'} ${handle.name || 'anonymous'}`);
    this.stack.push({route: path, handle});

    return this;
  }

  wrapper() {
    return this.handle.bind(this);
  }

  /**
   * Handle server requests, punting them down
   * the middleware stack.
   *
   */
  handle(req, res, out) {
    const protohost = getProtohost(req.url) || '';
    const stack = this.stack;
    let index = 0;
    let removed = '';
    let slashAdded = false;

    // final function handler
    const done = out || finalhandler(req, res, {env, onerror: logerror});

    // store the original URL
    req.originalUrl = req.originalUrl || req.url;

    /**
     * Next handler
     * @param err
     * @returns {*}
     */
    function next(err) {
      if (slashAdded) {
        req.url = req.url.substr(1);
        slashAdded = false;
      }

      if (removed.length !== 0) {
        req.url = protohost + removed + req.url.substr(protohost.length);
        removed = '';
      }

      // next callback
      const layer = stack[index++];

      // all done
      if (!layer) {
        defer(done, err);
        return;
      }

      // route data
      const path = parseUrl(req).pathname || '/';
      const route = layer.route;

      // skip this layer if the route doesn't match
      if (path.toLowerCase().substr(0, route.length) !== route.toLowerCase()) {
        return next(err);
      }

      // skip if route match does not border "/", ".", or end
      const c = path[route.length];
      if (c !== undefined && c !== '/' && c !== '.') {
        return next(err);
      }

      // trim off the part of the url that matches the route
      if (route.length !== 0 && route !== '/') {
        removed = route;
        req.url = protohost + req.url.substr(protohost.length + removed.length);

        // ensure leading slash
        if (!protohost && req.url[0] !== '/') {
          req.url = `/${req.url}`;
          slashAdded = true;
        }
      }

      // call the layer handle
      call(layer.handle, route, err, req, res, next);
    }

    next();
  }

  /**
   * Listen for connections.
   *
   * This method takes the same arguments
   * as node's `http.Server#listen()`.
   *
   * HTTP and HTTPS:
   *
   * If you run your application both as HTTP
   * and HTTPS you may wrap them individually,
   * since your Connect "server" is really just
   * a JavaScript `Function`.
   *
   *      const Connect = require('connect')
   *      const http = require('http')
   *      const https = require('https');
   *
   *      const app = new Connect();
   *
   *      http.createServer(app.wrapper()).listen(80);
   *      https.createServer(options, app.wrapper()).listen(443);
   *
   * @return {http.Server}
   * @api public
   */
  listen() {
    const server = http.createServer(this.handle);
    return server.listen.apply(server, arguments);
  }

}

/**
 * Module exports.
 * @public
 */

module.exports = Connect;

/**
 * Module constiables.
 * @private
 */

const env = process.env.NODE_ENV || 'development';

/* istanbul ignore next */
const defer =
  typeof setImmediate === 'function' ? setImmediate : (fn) => process.nextTick(fn.bind.apply(fn, arguments));

/**
 * Invoke a route handle.
 * @private
 */
function call(handle, route, err, req, res, next) {
  const arity = handle.length;
  const hasError = Boolean(err);
  let error = err;

  debug(`${handle.name || '<anonymous>'} ${route} : ${req.originalUrl}`);

  try {
    if (hasError && arity === 4) {
      // error-handling middleware
      handle(err, req, res, next);
      return;
    } else if (!hasError && arity < 4) {
      // request-handling middleware
      handle(req, res, next);
      return;
    }
  } catch (e) {
    // replace the error
    error = e;
  }

  // continue
  next(error);
}

/**
 * Log error using console.error.
 *
 * @param {Error} err
 * @private
 */
function logerror(err) {
  if (env !== 'test') console.error(err.stack || err.toString());
}

/**
 * Get get protocol + host for a URL.
 *
 * @param {string} url
 * @private
 */

function getProtohost(url) {
  if (url.length === 0 || url[0] === '/') {
    return undefined;
  }

  const searchIndex = url.indexOf('?');
  const pathLength = searchIndex !== -1 ? searchIndex : url.length;
  const fqdnIndex = url.substr(0, pathLength).indexOf('://');

  return fqdnIndex !== -1 ? url.substr(0, url.indexOf('/', 3 + fqdnIndex)) : undefined;
}