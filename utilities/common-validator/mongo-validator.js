// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const { Types } = require(`mongoose`);

/**
 * Validates whether a given value is a valid MongoDB ObjectId.
 * Throws an ApolloError if the value is invalid.
 *
 * @async
 * @function ValidateIdMongoose
 * @param {string|import('mongoose').Types.ObjectId} _id - The ID to validate.
 * @param {string} [fieldName='_id'] - The name of the field being validated, included in the error message.
 * @throws {ApolloError} - Thrown if the provided ID is not a valid MongoDB ObjectId.
 */
async function ValidateIdMongoose(_id, fieldName = '_id') {
  if (!Types.ObjectId.isValid(_id)) {
    throw new ApolloError(`Invalid ID for field "${fieldName}"`);
  }
}

// *************** EXPORT MODULE ***************
module.exports = ValidateIdMongoose;
