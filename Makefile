
NODE = node
TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js

test:
	@CONNECT_CWD=test/fixtures/app ./$(TEST) -I lib $(TESTS)

benchmark: benchmarks/run
	@./benchmarks/run

.PHONY: test test-debug benchmark