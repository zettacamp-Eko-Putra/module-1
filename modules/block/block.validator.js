// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Utility function to validate input object for creating or updating a Block.
 *
 * This function ensures that:
 * - The `name` field exists, is a string, and contains no special characters.
 * - The `description` field exists and is a string.
 *
 * @function ValidateBlockInput
 * @param {Object} blockInput - The input object for the Block.
 * @param {string} blockInput.name - The name of the Block.
 * @param {string} blockInput.description - The description of the Block.
 *
 * @throws {ApolloError} If any required field is missing or invalid.
 */
function ValidateBlockInput(blockInput) {
  // *************** validate block name
  if (!blockInput.name || typeof blockInput.name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('name is required and must be string');
  }

  // *************** validate if school school_legal_name has special character
  const specialRegexCharacter = /[^a-zA-Z0-9\s\-.]/;
  if (specialRegexCharacter.test(blockInput.name)) {
    throw new ApolloError(`Name must not contain special character`);
  }

  // *************** validate block description
  if (!blockInput.description || typeof blockInput.description !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('description is required and must be string');
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateBlockInput };
