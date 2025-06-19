// *************** IMPORT CORE ***************
require('dotenv').config();

// *************** Environment configuration
const config = {
  PORT: process.env.PORT,
  DB_NAME: process.env.DB_NAME,
  HOST: process.env.HOST,
};

// *************** EXPORT MODULE ***************
module.exports = config;
