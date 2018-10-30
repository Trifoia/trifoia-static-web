'use strict';
const webpack = require('webpack');
const FileUtil = require('./lib/file-util.js');
const path = require('path');

class WebpackConfig {
  constructor(entry = null, output = null) {
    // Set defaults
    if (!entry) {
      entry = {
        index: path.join(__dirname, 'src', 'js', 'index.js')
      };
    }
    if (!output) {
      output = {
        filename: 'notindex.js',
        path: __dirname + '/.pre_build/'
      };
    }

    this.entry = entry;
    this.output = output;
    this.mode = 'production';
    this.module = {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    };
  }
}

(async () => {
  console.log('Getting Javascript files...\n');
  // Each file in the `js` directory (that is NOT in the `lib` folder) is packed into its own chunk
  let basePath = path.join(__dirname, 'src', 'js');
  let files = await FileUtil.getDirRecursive(basePath);

  // Only read .js files
  files = files.filter((file) => FileUtil.getExtname(file) === 'js');

  // Filter out the lib folder
  files = files.filter((file) => file.indexOf(path.join(basePath, 'lib')) === -1);

  // Generate a webpack configuration for each file, then use that configuration to
  // begin a webpack promise
  let webpackPromises = files.map((file) => {
    let entry = {};
    entry[file] = file;

    // Generate the .pre_build file path
    let outFile = path.join(basePath, '..', '..', '.pre_build', FileUtil.removeBasepath(basePath, file));
    let output = {
      filename: `${path.basename(outFile)}`,
      path: path.dirname(outFile)
    };

    let config = new WebpackConfig(entry, output);
    return new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err) return reject(err);
        return resolve(stats);
      });
    });
  });

  // Webpack Everything!
  console.log('Beginning Webpack Operation...\n');
  let stats = await Promise.all(webpackPromises);
  console.log('Webpack Complete! Stats:\n');
  console.group();
  stats.forEach((stat) => console.log(stat.toString({colors: true}), '\n'));
  console.groupEnd();
})();
