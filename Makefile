.PHONY: install clean scss js ejs build
.DEFAULT_GOAL := build
START_TIME = $(shell date +%s)

# Installs node modules
install: 
	npm install

# Destroys all build artifacts
clean:
	rm -rf ./build/*
	rm -rf ./.pre_build/*

# Lints all files, and attempts to fix any that it can
lint:
	node ./node_modules/.bin/eslint . --fix

# Renders SCSS into CSS
scss:
	node ./lib/render_scss.js ./src/scss/ ./.pre_build/ ../config/scss_options.js

webpack:
	node ./lib/render_js.js

# Renders EJS into HTML
ejs:
	node ./lib/render_ejs.js ./src/ejs/ ./build/ ../config/ejs_options.js

# Renders PUG into HTML
pug:
	node ./lib/render_pug.js ./src/pug/ ./build/ ../config/pug_options.js

# Copies image files
image:
	cp src/images/ build/ -r

# Performs all build tasks
build: install lint clean scss webpack ejs pug image

# Performs all build tasks without installing anything
build-noinstall: lint clean scss webpack ejs pug image
