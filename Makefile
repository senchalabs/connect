
NODE = node
TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js

test:
	@CONNECT_ENV=test ./$(TEST) -I lib $(TEST_FLAGS) $(TESTS)

test-cov:
	@$(MAKE) test TEST_FLAGS="--cov"

benchmark: benchmarks/run
	@./benchmarks/run

graphs: benchmarks/graph
	@./benchmarks/graph

.PHONY: test test-cov benchmark graphs