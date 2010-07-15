#!/bin/sh -e

# http://www.silassewell.com/blog/2010/06/03/node-js-https-ssl-server-example/

openssl genrsa -out privatekey.pem 1024 
openssl req -new -key privatekey.pem -out certrequest.csr 
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
