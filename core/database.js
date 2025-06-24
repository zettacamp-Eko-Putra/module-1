// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const { HOST, DB_NAME } = require('./config');

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Uses the configured HOST and DB_NAME environment variables.
 * Logs a success message on successful connection, or logs an error if the connection fails.
 *
 * @async
 * @function ConnectToDB
 * @returns {Promise<void>} - A Promise that resolves when the database connection is successful.
 */
async function ConnectToMongoDB() {
  try {
    await mongoose.connect(`mongodb://${HOST}/${DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = ConnectToMongoDB;
