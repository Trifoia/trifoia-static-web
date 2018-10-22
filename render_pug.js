'use strict';
const path = require('path');
const fs = require('fs');

const pug = require('pug');

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
  let pugFilenames = fs.readdirSync(inDir).filter((file) => PUG_EXTENSION_REGEX.test(file));

  if (pugFilenames.length === 0) {
    // There weren't any pug files. Abort
    console.log('No PUG files found. Aborting operation\n');
    return;
  }

  // Render all the files found
  console.log('Rendering PUG..\n');
  let renderPromises = pugFilenames.map(async (filename) => {
    // Get the styling
    let style;
    try {
      // This match separates the file path from the file name
      style = fs.readFileSync(`./.pre_build/${filename.match(/(.+)\.pug$/)[1]}.css`);
    } catch (e) {
      // If no styling was found using the pug filename, get the generic 'style' sheet
      console.log(`INFO: Could not find matching CSS file for ${filename}, using generic style...`);
      try {
        style = fs.readFileSync('./.pre_build/style.css');
      } catch (e) {
        // There is no style information
        console.log(`INFO: Could not find generic stylesheet. ${filename} will be rendered with no styling`);
        style = '';
      }
    }
    pugOptions.style = style;
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

    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(outDir, filename), htmlString, (err) => {
        if (err) {
          return reject(err);
        }

        resolve(err);
      });
    });
  });
  await Promise.all(writePromises);

  console.log('PUG Rendering Complete!\n');
})();
