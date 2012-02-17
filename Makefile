
TESTS = test/*.js
REPORTER = dot
DOX = ./node_modules/.bin/dox

SRC = $(shell find lib -type f -name "*.js")
HTML = $(SRC:.js=.html)

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(TESTS)

docs: $(HTML)
	@mv $(HTML) docs

%.html: %.js
	$(DOX) < $< | node support/docs > $@

docclean:
	rm -f $(HTML)

site: docclean docs
	rm -fr /tmp/docs \
		&& cp -fr docs /tmp/docs \
	  && git checkout gh-pages \
	  && cp -fr /tmp/docs/* . \
	  && echo "done"

.PHONY: site docs test docclean