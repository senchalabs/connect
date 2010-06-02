
NODE = node
TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js
PREFIX = /usr/local

test:
	@CONNECT_ENV=test ./$(TEST) -I lib $(TEST_FLAGS) $(TESTS)

test-cov:
	@$(MAKE) test TEST_FLAGS="--cov"

install: docs
	cp -f docs/api.1 $(PREFIX)/man/man1/connect.1
	cp -f bin/connect $(PREFIX)/bin/connect

uninstall:
	rm -f $(PREFIX)/man/man1/connect.1
	rm -f $(PREFIX)/bin/connect

benchmark: benchmarks/run
	@./benchmarks/run

graphs: benchmarks/graph
	@./benchmarks/graph

docs: docs/api.1 docs/api.html

docs/api.1: docs/api.md
	ronn -r $< > $@

docs/api.html: docs/api.md
	ronn -5 --html $< > $@

docclean:
	rm -f docs/api.html
	rm -f docs/api.1

.PHONY: install uninstall docs test test-cov benchmark graphs docclean