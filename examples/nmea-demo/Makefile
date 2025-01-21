
dev:
	rm -rf node_modules/.vite
	npm link @jbroll/nmea-widgets
	npm run build:dev
	npm run dev

preview:
	rm -rf node_modules/.vite
	TAG=$$(cd ../..; eval echo $$(npm pkg get version)); npm install "@jbroll/nmea-widgets@$$TAG"
	npm run build
	npm run preview

build:
	TAG=$$(cd ../..; eval echo $$(npm pkg get version)); npm install "@jbroll/nmea-widgets@$$TAG"
	npm run build

