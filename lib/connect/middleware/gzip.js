try {
    module.exports = require('./gzip-compress');
} catch (e) {
    if (/^Cannot find module /.test(e.message))
        module.exports = require('./gzip-proc');
    else
        throw e;
}