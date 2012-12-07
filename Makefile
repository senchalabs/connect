
TESTS = test/*.js
REPORTER = dot
DOX = ./node_modules/.bin/dox

SRC = $(shell find lib/*.js lib/middleware/*.js)
HTML = $(SRC:.js=.html)

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--timeout 600 \
		$(TESTS)

docs: $(HTML)
	@mv $(HTML) docs

test-cov:
	@NODE_ENV=test cover run ./node_modules/mocha/bin/_mocha && cover report html

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

benchmark:
	@./support/bench

.PHONY: test-cov site docs test docclean benchmark
