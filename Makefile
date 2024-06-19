install:
	npm ci
dev:
	npm run serve
build:
	NODE_ENV=production npx webpack
lint:
	npx eslint .
