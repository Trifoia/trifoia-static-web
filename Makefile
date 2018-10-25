.PHONY: install clean scss js ejs build
START_TIME = $(shell date +%s)

# Installs node modules
install: 
	npm install

# Destroys all build artifacts
clean:
	rm -rf ./build/*
	rm -rf ./.pre_build/*

# Renders SCSS into CSS
scss:
	node render_scss.js ./src/scss/ ./.pre_build/ ./config/scss_options.js

# TODO: WebPack + Babble JavaScript

# Renders EJS into HTML
ejs:
	node render_ejs.js ./src/ejs/ ./build/ ./config/ejs_options.js

# Renders PUG into HTML
pug:
	node render_pug.js ./src/pug/ ./build/ ./config/pug_options.js

# Copies image files
image:
	cp images/ build/ -r

# Performs all build tasks
build: install clean scss ejs pug image

# Performs all build tasks without installing anything
build-noinstall: clean scss ejs pug image
