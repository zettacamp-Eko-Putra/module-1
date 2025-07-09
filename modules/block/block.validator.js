// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Validates the input object for creating or updating a block.
 *
 * @function ValidateBlockInput
 * @param {Object} block_input - Input object containing block details.
 * @param {string} block_input.name - Name of the block to validate.
 * @param {string} block_input.description - Description of the block to validate.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - The name is missing or not a string.
 * - The name contains special characters (only letters, numbers, spaces, hyphens, and dots are allowed).
 * - The description is missing or not a string.
 */
function ValidateBlockInput(block_input) {
  // *************** validate block name
  if (!block_input.name || typeof block_input.name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('name is required and must be string');
  }

  // *************** validate if school school_legal_name has special character
  const specialRegexCharacter = /[^a-zA-Z0-9\s\-.]/;
  if (specialRegexCharacter.test(block_input.name)) {
    throw new ApolloError(`Name must not contain special character`);
  }

  // *************** validate block description
  if (!block_input.description || typeof block_input.description !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('description is required and must be string');
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateBlockInput };
