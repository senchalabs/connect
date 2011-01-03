
NODE = node
TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js
PREFIX = /usr/local
LIB_PREFIX = $(HOME)/.node_libraries

test:
	@NODE_ENV=test ./$(TEST) \
		-I lib \
		-I support/coffee-script/lib \
		-I support/sass/lib \
		-I support/less/lib \
		$(TEST_FLAGS) $(TESTS)

test-cov:
	@$(MAKE) test TEST_FLAGS="--cov"

install:
	cp -fr lib/connect $(LIB_PREFIX)/connect

uninstall:
	rm -f $(PREFIX)/share/man/man1/connect.1
	rm -f $(PREFIX)/share/man/man1/connect-*.1
	rm -fr $(LIB_PREFIX)/connect

benchmark: benchmarks/run
	@./benchmarks/run

graphs: benchmarks/graph
	@./benchmarks/graph

docs: docs/api.html

docs/api.html:
	dox --title Connect \
		--desc "High performance middleware for [node](http://nodejs.org)." \
		$(shell find lib/connect/middleware/* -type f) > $@

.PHONY: install uninstall docs test test-cov benchmark graphs