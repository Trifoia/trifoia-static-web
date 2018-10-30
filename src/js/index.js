'use strict';
// Polyfill is required for advanced operations
require('babel-polyfill');

/**
 * This is a demo js file for the trifoia static web framework that showcases babel and webpack
 */
(async () => {
  // Wait 2 seconds and then make a log. Babel will handle backwards compatibility!
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });

  console.log('Test Successful!');
})();
