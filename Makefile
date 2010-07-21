
NODE = node
TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js
PREFIX = /usr/local
LIB_PREFIX = $(HOME)/.node_libraries
DOCS = docs/index.md \
	   docs/methodOverride.md \
	   docs/conditionalGet.md \
	   docs/cookieDecoder.md \
	   docs/responseTime.md \
	   docs/bodyDecoder.md \
	   docs/errorHandler.md \
	   docs/session.md \
	   docs/jsonrpc.md \
	   docs/format.md \
	   docs/staticProvider.md \
	   docs/compiler.md \
	   docs/router.md \
	   docs/lint.md \
	   docs/logger.md

MANPAGES = $(DOCS:.md=.1)
HTMLDOCS = $(DOCS:.md=.html)

test:
	@CONNECT_ENV=test ./$(TEST) \
		--growl \
		-I lib \
		-I support/sass/lib \
		-I support/less/lib \
		$(TEST_FLAGS) $(TESTS)

test-cov:
	@$(MAKE) test TEST_FLAGS="--cov"

install: install-docs
	cp -fr lib/connect $(LIB_PREFIX)/connect

uninstall:
	rm -f $(PREFIX)/share/man/man1/connect.1
	rm -f $(PREFIX)/share/man/man1/connect-*.1
	rm -fr $(LIB_PREFIX)/connect

install-docs:
	cp -f docs/index.1 $(PREFIX)/share/man/man1/connect.1
	cp -f docs/bodyDecoder.1 $(PREFIX)/share/man/man1/connect-bodyDecoder.1
	cp -f docs/conditionalGet.1 $(PREFIX)/share/man/man1/connect-conditionalGet.1
	cp -f docs/errorHandler.1 $(PREFIX)/share/man/man1/connect-errorHandler.1
	cp -f docs/methodOverride.1 $(PREFIX)/share/man/man1/connect-methodOverride.1
	cp -f docs/responseTime.1 $(PREFIX)/share/man/man1/connect-responseTime.1
	cp -f docs/format.1 $(PREFIX)/share/man/man1/connect-format.1
	cp -f docs/lint.1 $(PREFIX)/share/man/man1/connect-lint.1
	cp -f docs/staticProvider.1 $(PREFIX)/share/man/man1/connect-staticProvider.1
	cp -f docs/logger.1 $(PREFIX)/share/man/man1/connect-logger.1
	cp -f docs/router.1 $(PREFIX)/share/man/man1/connect-router.1
	cp -f docs/cookieDecoder.1 $(PREFIX)/share/man/man1/connect-cookieDecoder.1
	cp -f docs/session.1 $(PREFIX)/share/man/man1/connect-session.1
	cp -f docs/jsonrpc.1 $(PREFIX)/share/man/man1/connect-jsonrpc.1
	cp -f docs/compiler.1 $(PREFIX)/share/man/man1/connect-compiler.1

benchmark: benchmarks/run
	@./benchmarks/run

graphs: benchmarks/graph
	@./benchmarks/graph

docs: docs/api.html $(MANPAGES) $(HTMLDOCS)

docs/api.html:
	dox --title Connect \
		--desc "High performance middleware for [node](http://nodejs.org)." \
		$(shell find lib/connect/middleware/* -type f) > $@

%.1: %.md
	@echo "... $< -> $@"
	@ronn -r --pipe $< > $@ &

%.html: %.md
	@echo "... $< -> $@"
	@ronn -5 --pipe --fragment $< \
	  | cat docs/layout/api.head.html - docs/layout/api.foot.html \
	  | sed 's/NAME/Connect/g' \
	  | node support/highlight.js \
	  > $@ &

docclean:
	rm -f docs/*.{1,html}

.PHONY: install uninstall docs test test-cov benchmark graphs install-docs docclean