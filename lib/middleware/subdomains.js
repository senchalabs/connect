
/*!
 * Connect - subdomains
 * Copyright(c) 2012 Sencha Inc.
 * Copyright(c) 2012 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Subdomains:
 *
 *   Populate the `req.subdomains` array.
 *   For example "ferret.tobi.example.com"
 *   would yield `['tobi', 'ferret']`.
 *
 * @return {Function}
 * @api public
 */

module.exports = function(){
  return function subdomains(req, res, next){
    req.subdomains = req.headers.host
      .split('.')
      .slice(0, -2)
      .reverse();

    next();
  };
};

