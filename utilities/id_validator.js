// *************** IMPORT LIBRARY ***************
const { Types } = require(`mongoose`);

/**
 * Validates whether the provided ID is a valid Mongoose ObjectId.
 * Throws an error if the ID is invalid.
 *
 * @function ValidateIdMongoose
 * @param {string|import('mongoose').Types.ObjectId} _id - The ID to validate.
 * @throws {Error} Throws an error if the ID is not a valid ObjectId.
 */
async function ValidateIdMongoose(_id) {
  if (!Types.ObjectId.isValid(_id)) {
    throw new Error(`Invalid ID`);
  }
}

// *************** EXPORT MODULE ***************
module.exports = ValidateIdMongoose;
