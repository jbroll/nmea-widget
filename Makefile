.PHONY: run build-dev build-prod publish-dev publish-rc publish check-version

# Development server
run:
	npm run dev

# Build helpers
build-dev:
	npm run build:dev

build-prod:
	npm run build

# Version checking
check-version:
	@case "$(TAG)" in \
	dev) : ;; \
	rc) \
		CURRENT_VERSION=`npm pkg get version | tr -d '"'`; \
		if echo "$$CURRENT_VERSION" | grep -q ".*-\(dev\|rc\)\.[0-9]*$$"; then : ; else \
			echo "Error: Current version must be a dev or rc version before publishing RC"; \
			exit 1; \
		fi;; \
	*) \
		CURRENT_VERSION=`npm pkg get version | tr -d '"'`; \
		if echo "$$CURRENT_VERSION" | grep -q ".*-rc\.[0-9]*$$"; then : ; else \
			echo "Error: Current version must be an RC version before publishing prod"; \
			exit 1; \
		fi;; \
	esac

# Publishing with tag
publish-tagged: check-version
	@VERSION=`npm pkg get version | tr -d '"' | sed 's/-.*$$//'`; \
	if npm pkg get version | tr -d '"' | grep -q ".*-$(TAG)\.[0-9]*$$"; then \
		echo "Incrementing existing $(TAG) version..."; \
		npm version prerelease --preid $(TAG) $(if $(filter dev,$(TAG)),--no-git-tag-version); \
	else \
		echo "Converting to $(TAG) version..."; \
		npm version "$$VERSION-$(TAG).0" $(if $(filter dev,$(TAG)),--no-git-tag-version); \
	fi
	npm run $(if $(filter dev,$(TAG)),build:dev,build)
	npm publish --tag $(TAG) --access public

# Convenience targets
publish-dev:
	@$(MAKE) publish-tagged TAG=dev

publish-rc:
	@$(MAKE) publish-tagged TAG=rc

# Production publish
publish: check-version
	@VERSION=`npm pkg get version | tr -d '"' | sed 's/-rc\.[0-9]*$$//'`; \
	echo "Creating production version $$VERSION..."; \
	npm version "$$VERSION"; \
	npm run build; \
	npm publish --access public