all:
	@echo "Please specify a target"

test: spec/spec.js lib/rational.js
	./node_modules/vows/bin/vows spec/spec.js

docs: docs/ lib/rational.js docs.json
	./node_modules/dr-js/bin/dr-js docs.json
