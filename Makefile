
test:
	@./node_modules/.bin/mocha --growl $(TESTFLAGS) --reporter spec test/*.js

.PHONY: test
