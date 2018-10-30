'use strict';
const path = require('path');

const pug = require('pug');
const FileUtil = require('./lib/file-util.js');

const PUG_EXTENSION_REGEX = /.pug$/;

/**
 * Node program is used to process pug and is highly configurable
 */
(async function() {
  // Get arguments
  const inDir = process.argv[2];
  const outDir = process.argv[3];
  const optsFileName = process.argv[4];

  // Get options
  let pugOptions;
  try {
    pugOptions = require(optsFileName);
  } catch (e) {
    console.error('ERROR GETTING PUG OPTIONS');
    console.error(e);
    throw e;
  }

  // Force async
  if (!pugOptions) console.warn('Async required for operation - enabling');
  pugOptions.async = true;

  // Get all pug files in the root of the inDir
  console.log('Getting filenames...\n');
  let pugFilenames = await FileUtil.getDirRecursive(inDir);

  // Explicitly filter out partials
  pugFilenames = pugFilenames.filter((filename) => !/^src\/pug\/partials\//.test(filename));
  pugFilenames = pugFilenames.map((filename) => filename.match(/^src\/pug\/(.+)/)[1]);

  if (pugFilenames.length === 0) {
    // There weren't any pug files. Abort
    console.log('No PUG files found. Aborting operation\n');
    return;
  }

  // Get all the previously rendered stylesheets
  console.log('Retrieving Stylesheets...\n');
  let cssFilenames = await FileUtil.getDirRecursive('./.pre_build');

  // Filter out non-css filenames and get files
  cssFilenames = cssFilenames.filter((filename) => FileUtil.getExtname(filename) === 'css');
  let readPromises = cssFilenames.map((filename) => FileUtil.readFile(filename).then((buff) => {
    // Automatically convert the buffer to a string
    return buff.toString();
  }));
  let styleArray = await Promise.all(readPromises);

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
  console.log('Rendering PUG..\n');
  let renderPromises = pugFilenames.map(async (filename) => {
    pugOptions.styles = styles;
    pugOptions.scripts = scripts;
    pugOptions.filename = filename;

    // All PUG operations are synchronous. The return value will automatically be wrapped in a promise result
    return pug.renderFile(path.join(inDir, filename), pugOptions);
  });
  let rendered = await Promise.all(renderPromises);

  // Save all the files
  console.log('Writing HTML..\n');
  let writePromises = rendered.map((htmlString, index) => {
    // Alter the pug filename to an html extension
    let filename = pugFilenames[index].replace(PUG_EXTENSION_REGEX, '.html');

    return FileUtil.makeFile(path.join(outDir, filename), htmlString);
  });
  await Promise.all(writePromises);

  console.log('PUG Rendering Complete!\n');
})();
