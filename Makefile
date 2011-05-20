
TEST = node_modules/.bin/expresso
TESTS ?= test/*.test.js
SRC = $(shell find lib -type f -name "*.js")

test:
	@NODE_ENV=test ./$(TEST) \
		-I lib \
		$(TEST_FLAGS) $(TESTS)

test-cov:
	@$(MAKE) test TEST_FLAGS="--cov"

docs:
	@mkdir -p docs
	@node support/docs.js $(SRC)

docclean:
	rm -f docs/*.{html,json}

site: docclean docs
	rm -fr /tmp/docs \
		&& cp -fr docs /tmp/docs \
	  && git checkout gh-pages \
	  && cp -fr /tmp/docs/* . \
	  && echo "done"

.PHONY: site docs test test-cov docclean