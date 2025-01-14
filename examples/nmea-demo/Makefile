
dev: node_modules
	TAG=$$(cd ../..; eval echo $$(npm pkg get version)); npm install "@jbroll/nmea-widgets@$$TAG"
	npm run build:dev
	npm run dev

build: node_modules
	TAG=$$(cd ../..; eval echo $$(npm pkg get version)); npm install "@jbroll/nmea-widgets@$$TAG"
	npm run build

simple: node_modules
	rm -r node_modules/nmea-simple
	npm install nmea-simple@file:/home/john/src/nmea-simple --force 
	npm run build
	rm -r node_modules/.vite/deps/

node_modules:
	npm install

