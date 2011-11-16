all:
	@echo "Please specify a target"

test:
	./node_modules/vows/bin/vows spec/spec.js

docs:
	./node_modules/dr-js/bin/dr-js docs.json
