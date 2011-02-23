
TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js
LIB_PREFIX = $(HOME)/.node_libraries

test:
	@NODE_ENV=test ./$(TEST) \
		-I lib \
		-I support \
		-I support/coffee-script/lib \
		-I support/sass/lib \
		-I support/less/lib \
		$(TEST_FLAGS) $(TESTS)

test-cov:
	@$(MAKE) test TEST_FLAGS="--cov"

docs: docs/api.html

docs/api.html:
	dox --title Connect \
		--desc "High performance middleware for [node](http://nodejs.org)." \
		$(shell find lib/connect/middleware/* -type f) > $@

.PHONY: docs test test-cov