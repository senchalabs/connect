#!/bin/sh -e
#
# Use ./genkeycert.sh before running!
#
# Demonstrates usage of SSL support in the connect(1) binary.
#

../../bin/connect --ssl-key privatekey.pem --ssl-crt certificate.pem
