
NODE = node
TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js
PREFIX = /usr/local

test:
	@CONNECT_ENV=test ./$(TEST) -I lib $(TEST_FLAGS) $(TESTS)

test-cov:
	@$(MAKE) test TEST_FLAGS="--cov"

install: docs
	cp -f docs/connect.1 $(PREFIX)/man/man1/connect.1

uninstall:
	rm -f $(PREFIX)/man/man1/connect.1 

benchmark: benchmarks/run
	@./benchmarks/run

graphs: benchmarks/graph
	@./benchmarks/graph

docs: docs/connect.1

docs/connect.1: docs/api.md
	ronn --roff $< > $@

.PHONY: install uninstall docs test test-cov benchmark graphs