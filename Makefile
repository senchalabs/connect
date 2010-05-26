
NODE = node

test:
	@CONNECT_CWD=test/fixtures/app $(NODE) bin/ext-test -I lib test/*.js

test-debug:
	@CONNECT_CWD=test/fixtures/app $(NODE) --debug-brk bin/ext-test -I lib test/*.js

.PHONY: test test-debug