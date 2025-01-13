
build:
	npm run build

rc:
	npm version prerelease --preid rc
	npm publish --tag rc --access public

publish:
	TAG=$$(eval echo $$(npm pkg get version)); npm version $${TAG%%-*}
	npm pkg get version
	npm publish --tag rc --access public

simple:
	rm -r node_modules/nmea-simple
	npm install nmea-simple@file:/home/john/src/nmea-simple --force 
	npm run build
	rm -r node_modules/.vite/deps/
