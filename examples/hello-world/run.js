#!/usr/bin/env node

require('./lib/connect').createServer(require('./app')).listen();