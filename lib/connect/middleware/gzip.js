try {
    module.exports = require('./gzip-compress');
} catch (e) {
    if (/^Cannot find module /.test(e.message)) {
        console.warn("Can't find fast C-based gzip-compress module, using slow as hell JS version instead. Install the node-compress library!")
        module.exports = require('./gzip-proc');
    }
    else
        throw e;
}