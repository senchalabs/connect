
NODE = node
TEST = support/expresso/bin/expresso
TESTS ?= test/*.test.js
PREFIX = /usr/local
DOCS = docs/api.md \
	   docs/middleware/body-decoder.md \
	   docs/middleware/redirect.md \
	   docs/middleware/session.md \
	   docs/middleware/static.md \
	   docs/middleware/cookie.md \
	   docs/middleware/rest.md \
	   docs/middleware/sass.md \
	   docs/middleware/log.md

MANPAGES = $(DOCS:.md=.1)
HTMLDOCS = $(DOCS:.md=.html)

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
	cp -f docs/middleware/redirect.1 $(PREFIX)/share/man/man1/connect-redirect.1
	cp -f docs/middleware/static.1 $(PREFIX)/share/man/man1/connect-static.1
	cp -f docs/middleware/log.1 $(PREFIX)/share/man/man1/connect-log.1
	cp -f docs/middleware/rest.1 $(PREFIX)/share/man/man1/connect-rest.1
	cp -f docs/middleware/sass.1 $(PREFIX)/share/man/man1/connect-sass.1
	cp -f docs/middleware/cookie.1 $(PREFIX)/share/man/man1/connect-cookie.1
	cp -f docs/middleware/session.1 $(PREFIX)/share/man/man1/connect-session.1

benchmark: benchmarks/run
	@./benchmarks/run

graphs: benchmarks/graph
	@./benchmarks/graph

docs: $(MANPAGES) $(HTMLDOCS)

%.1: %.md
	@echo "... $< -> $@"
	@ronn -r --pipe $< > $@

%.html: %.md
	@echo "... $< -> $@"
	@ronn -5 --pipe --fragment $< \
	  | cat docs/api.head.html - docs/api.foot.html \
	  | sed 's/NAME/Connect/g' \
	  > $@

docclean:
	rm -f docs/api.{1,html}
	rm -f docs/middleware/*.{1,html}

.PHONY: install uninstall docs test test-cov benchmark graphs install-docs docclean