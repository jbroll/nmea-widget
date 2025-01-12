
build:
	npm run dev


simple:
	rm -r node_modules/nmea-simple
	npm install nmea-simple@file:/home/john/src/nmea-simple --force 
	npm run build
	rm -r node_modules/.vite/deps/
