
NODE = node
TEST = support/expresso/bin/expresso

test:
	@CONNECT_CWD=test/fixtures/app ./$(TEST) -I lib test/*.test.js

.PHONY: test test-debug