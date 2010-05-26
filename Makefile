
NODE = node

test:
	@EXT_CWD=test/fixtures/app $(NODE) bin/ext-test -I lib test/*.js

test-debug:
	@EXT_CWD=test/fixtures/app $(NODE) --debug-brk bin/ext-test -I lib test/*.js

.PHONY: test test-debug