#!/usr/bin/env node
/**
 * Demonstrates enabling SSL on the nodejs http.Server when starting
 * Connect from JavaScript.
 */

var crypto = require('crypto');
var fs = require('fs');

var app = require('./app');
app.env = { host: '*',
            port: 3000
          };

var creds = crypto.createCredentials(
    { key: fs.readFileSync('privatekey.pem', 'ascii'),
      cert: fs.readFileSync('certificate.pem', 'ascii')
    });
app.setSecure(creds);

app.listen();
