.PHONY: run build-dev build-prod publish-dev publish-rc publish check-version

# Development server
run:
	npm run build:dev


rc: simple
	npm version prerelease --preid rc
	npm run build:dev
	npm publish --tag rc --access public

publish: simple
	TAG=$$(eval echo $$(npm pkg get version)); npm version $${TAG%%-*}
	npm pkg get version
	npm publish --access public

# Build helpers
build-dev:

build-prod:
	npm run build

simple:
	npm install $$(cd ../nmea-simple; echo @jbroll/nmea-simple@$$(npm pkg get version) --force | tr -d '"')

