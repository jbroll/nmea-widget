
dev: node_modules
	TAG=$$(cd ../..; eval echo $$(npm pkg get version)); npm install "@jbroll/nmea-widgets@$$TAG"
	npm run build:dev
	npm run dev

build: node_modules
	TAG=$$(cd ../..; eval echo $$(npm pkg get version)); npm install "@jbroll/nmea-widgets@$$TAG"
	npm run build

node_modules:
	npm install

