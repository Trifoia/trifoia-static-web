# {{NAME}}
{{DESCRIPTION}}

## External Libraries
This project uses the following external libraries:

| Library Name | Version  |
|--------------|----------|
| Node         | ^10.10.0 |
| NPM          | ^6.4.1   |
| GNU Make     | ^4.1     |
---------------------------

Note that if on a platform without GNU Make, the individual targets can still be called using equivalent bash / cmd statements

## Usage
Once the framework has been set up, use the following command to install build dependencies
```
  $ make install
```

The following make target will build all resources and save them in the [build](build/) directory:
```
  $ make build
```

Additional Make targets are also available for finer build control. See the [Makefile](Makefile) for more information

## Configuration
Adjust the configuration files in the [config](config/) directory to adjust ejs, scss, and webpack options. See individual
files for more information

## Directory Structure
```
|- .pre_build // Processed JS and SCSS saved here for debug purposes
|- build      // Final html files saved here
|- config     // Configuration files
|- images     // Images used by the website - may have subdirectories
|- src        // Source file directory
  |- ejs        // Raw EJS files
    |- partials   // EJS Partials that are not rendered directly
  |- js         // Raw Javascript files
  |- scss       // Raw SCSS files
```

# Ultimate Framework Factory
This framework is designed to be used in conjunction with the [Ultimate Framework Factory](https://github.com/Trifoia/ultimate-framework-factory) and
requires the following variables to be defined:

NAME:
- The name of the project, should not include spaces

DESCRIPTION:
- A human friendly description of the project

This framework _may_ be used directly by manually replacing all variables

## Tips
- Run `npm init` _after_ setup to automatically fill out the package.json
