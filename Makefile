
NODE = node

test:
	@$(NODE) bin/ext-test -I lib test/*.js

test-debug:
	@$(NODE) --debug-brk bin/ext-test -I lib test/*.js

.PHONY: test test-debug