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
function ValidateIdMongoose(_id, fieldName = '_id') {
  if (!Types.ObjectId.isValid(_id)) {
    throw new ApolloError(`Invalid ID for field "${fieldName}"`);
  }
}

/**
 * Validates an array of MongoDB ObjectIDs.
 *
 * Iterates through the provided array and verifies that each value is a valid MongoDB ObjectID.
 * If any ID is invalid, throws an `ApolloError` with a message including the provided label.
 *
 * @function ValidateArrayIdMongoose
 * @param {Array<string|import('mongoose').Types.ObjectId>} idArray - Array of IDs to validate.
 * @param {string} label - A label used in the error message to identify the source of the IDs.
 *
 * @throws {ApolloError} - If any ID in the array is invalid.
 */
function ValidateArrayIdMongoose(idArray, label) {
  idArray.forEach((id) => {
    if (!Types.ObjectId.isValid(id)) {
      throw new ApolloError(`Invalid ${label} : ${id}`);
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateIdMongoose, ValidateArrayIdMongoose };
