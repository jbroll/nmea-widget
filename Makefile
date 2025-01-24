.PHONY: run build-dev build-prod publish-dev publish-rc publish check-version

run: simple
	npm run build:dev
	cd examples/nmea-demo; npm link @jbroll/nmea-widgets; make

rc: simple
	npm version prerelease --preid rc
	npm run build:dev
	npm publish --tag rc --access public

patch: VTYPE=patch
patch: publishVType

publish: VTYPE=minor
publish: publishVType

publishVType: simple
	npm version $(VTYPE)
	TAG=$$(npm pkg get version); $(MAKE) demoVersion TAG=$$TAG
	git add . && git commit --amend --no-edit
	npm publish
	echo Published $$(npm pkg get version)

demoVersion:
	cd examples/nmea-demo; npm pkg set dependencies.@jbroll/nmea-widgets=$(TAG)
	

# Build helpers
build-dev:

build-prod:
	npm run build

simple:
	npm install $$(cd ../nmea-simple; echo @jbroll/nmea-simple@$$(npm pkg get version) | tr -d '"')

