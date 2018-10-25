'use strict';
const path = require('path');
const fs = require('fs');

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

  // Render all the files found
  console.log('Rendering EJS..\n');
  let renderPromises = ejsFilenames.map((filename) => {
    // Get the styling
    let style;
    try {
      // This match separates the file path from the file name
      style = fs.readFileSync(`./.pre_build/${filename.match(/(.+)\.ejs/)[1]}.css`);
    } catch (e) {
      // If no styling was found using the ejs filename, get the generic 'style' sheet
      console.log(`INFO: Could not find matching CSS file for ${filename}, using generic style...`);
      try {
        style = fs.readFileSync('./.pre_build/style.css');
      } catch (e) {
        // There is no style information
        console.log(`INFO: Could not find generic stylesheet. ${filename} will be rendered with no styling`);
        style = '';
      }
    }
    return ejs.renderFile(path.join(inDir, filename), {style: style}, ejsOptions);
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
