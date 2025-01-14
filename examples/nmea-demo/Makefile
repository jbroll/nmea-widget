
dev: node_modules
	npm run dev

build: node_modules
	npm run build

simple: node_modules
	rm -r node_modules/nmea-simple
	npm install nmea-simple@file:/home/john/src/nmea-simple --force 
	npm run build
	rm -r node_modules/.vite/deps/

node_modules:
	npm install

