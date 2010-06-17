
NODE = node
TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js
PREFIX = /usr/local
DOCS = docs/api.md docs/middleware/body-decoder.md
MANPAGES = $(DOCS:.md=.1)

test:
	@CONNECT_ENV=test ./$(TEST) -I lib -I support/sass/lib $(TEST_FLAGS) $(TESTS)

test-cov:
	@$(MAKE) test TEST_FLAGS="--cov"

install: install-docs
	cp -f bin/connect $(PREFIX)/bin/connect

uninstall:
	rm -f $(PREFIX)/share/man/man1/connect.1
	rm -f $(PREFIX)/bin/connect

install-docs:
	cp -f docs/api.1 $(PREFIX)/share/man/man1/connect.1
	cp -f docs/middleware/body-decoder.1 $(PREFIX)/share/man/man1/connect-body-decoder.1

benchmark: benchmarks/run
	@./benchmarks/run

graphs: benchmarks/graph
	@./benchmarks/graph

docs: $(MANPAGES) $(DOCS:.md=.html)

%.1: %.md
	ronn -r --pipe $< > $@

%.html: %.md
	ronn -5 --pipe --fragment $< \
	  | cat docs/api.head.html - docs/api.foot.html \
	  | sed 's/NAME/Connect/g' \
	  > $@

site:
	cp docs/api.html /tmp/connect.index.html && \
	  git checkout gh-pages && \
	  cp /tmp/connect.index.html index.html && \
	  git commit -a -m 'Updated index.html' && \
	  git checkout master

.PHONY: install uninstall docs test test-cov benchmark graphs site install-docs