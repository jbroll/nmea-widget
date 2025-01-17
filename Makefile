.PHONY: run build-dev build-prod publish-dev publish-rc publish check-version

run: simple
	npm run build:dev
	cd examples/nmea-demo; make

rc: simple
	npm version prerelease --preid rc
	npm run build:dev
	npm publish --tag rc --access public

publish: simple
	# TAG=$$(eval echo $$(npm pkg get version)); npm version $${TAG%%-*}
	cd examples/nmea-demo; $(MAKE) build
	npm version patch
	npm publish --access public
	echo Published $$(npm pkg get version)

# Build helpers
build-dev:

build-prod:
	npm run build

simple:
	npm install $$(cd ../nmea-simple; echo @jbroll/nmea-simple@$$(npm pkg get version) --force | tr -d '"')

