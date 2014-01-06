
TESTS = test/*.js
REPORTER = dot

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(TESTS)

test-cov: lib-cov
	@CONNECT_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib $@

benchmark:
	@./support/bench

.PHONY: test-cov test benchmark