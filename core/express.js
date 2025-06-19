// *************** IMPORT LIBRARY ***************
const express = require('express');

// *************** Function to initialize and return an Express application
/**
 * Initializes and returns a new Express application instance.
 *
 * @function getExpressApp
 * @returns {import('express').Express} - A new Express app instance.
 */
function CreateExpressApp() {
  const app = express();
  return app;
}

// *************** EXPORT MODULE ***************
module.exports = CreateExpressApp;
