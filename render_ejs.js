'use strict';
const path = require('path');

const ejs = require('ejs');
const FileUtil = require('./lib/file-util.js');

const EJS_EXTENSION_REGEX = /.ejs$/;

/**
 * Node program is used to process ejs and is highly configurable
 */
(async function() {
  // Get arguments
  const inDir = process.argv[2];
  const outDir = process.argv[3];
  const optsFileName = process.argv[4];

  // Get options
  let ejsOptions;
  try {
    ejsOptions = require(optsFileName);
  } catch (e) {
    console.error('ERROR GETTING EJS OPTIONS');
    console.error(e);
    throw e;
  }

  // Force async
  if (!ejsOptions) console.warn('Async required for operation - enabling');
  ejsOptions.async = true;

  // Get all ejs files in the root of the inDir
  console.log('Getting filenames...\n');
  let ejsFilenames = await FileUtil.getDirRecursive(inDir);

  // Explicitly filter out partials and strip out the base directory
  ejsFilenames = ejsFilenames.filter((filename) => !/^src\/ejs\/partials\//.test(filename));
  ejsFilenames = ejsFilenames.map((filename) => filename.match(/^src\/ejs\/(.+)/)[1]);

  if (ejsFilenames.length === 0) {
    // There weren't any ejs files. Abort
    console.log('No EJS files found. Aborting operation\n');
    return;
  }

  // Get all the previously rendered stylesheets
  console.log('Retrieving Stylesheets...\n');
  let cssFilenames = await FileUtil.getDirRecursive('./.pre_build');

  // Filter out non-css filenames and get files
  cssFilenames = cssFilenames.filter((filename) => FileUtil.getExtname(filename) === 'css');
  let cssReadPromises = cssFilenames.map((filename) => FileUtil.readFile(filename).then((buff) => {
    // Automatically convert the buffer to a string
    return buff.toString();
  }));
  let styleArray = await Promise.all(cssReadPromises);

  // The style Array is, by definition, parallel to the cssFilenames array. Use this fact to organize the styles into
  // an object
  let styles = {};
  styleArray.forEach((style, index) => {
    let cssFilename = cssFilenames[index];

    // Split the css filename into its directories, removing the '.prebuild' dir, then join them back together again
    cssFilename = cssFilename.split(path.sep).slice(1).join(path.sep);
    styles[cssFilename] = style;
  });

  // Get all the previously rendered scripts
  console.log('Retrieving scripts...\n');
  let jsFilenames = await FileUtil.getDirRecursive('./.pre_build');

  // Filter out non-js filenames and get files
  jsFilenames = jsFilenames.filter((filename) => FileUtil.getExtname(filename) === 'js');
  let jsReadPromises = jsFilenames.map((filename) => FileUtil.readFile(filename).then((buff) => {
    // Automatically convert the buffer to a string
    return buff.toString();
  }));
  let scriptArray = await Promise.all(jsReadPromises);

  // The script Array is, by definition, parallel to the jsFilenames array. Use this fact to organize the scripts into
  // an object
  let scripts = {};
  scriptArray.forEach((script, index) => {
    let jsFilename = jsFilenames[index];

    // Split the js filename into its directories, removing the '.prebuild' dir, then join them back together again
    jsFilename = jsFilename.split(path.sep).slice(1).join(path.sep);
    scripts[jsFilename] = script;
  });

  // Render all the files found
  console.log('Rendering EJS..\n');
  let locals = {styles, scripts};
  let renderPromises = ejsFilenames.map((filename) => {
    return ejs.renderFile(path.join(inDir, filename), locals, ejsOptions);
  });
  let rendered = await Promise.all(renderPromises);

  // Save all the files
  console.log('Writing HTML..\n');
  let writePromises = rendered.map((htmlString, index) => {
    // Alter the ejs filename to an html extension
    let filename = ejsFilenames[index].replace(EJS_EXTENSION_REGEX, '.html');

    return FileUtil.makeFile(path.join(outDir, filename), htmlString);
  });
  await Promise.all(writePromises);

  console.log('EJS Rendering Complete!\n');
})();
