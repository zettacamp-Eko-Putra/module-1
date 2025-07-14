// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Validates the published status input.
 *
 * Ensures the provided status is one of the allowed enum values: 'PUBLISHED' or 'NOT_PUBLISHED'.
 *
 * @function ValidatePublishedStatus
 * @param {string} publishedStatus - The published status to validate.
 *
 * @throws {ApolloError} If the published status is not one of the allowed values.
 */
function ValidatePublishedStatus(publishedStatus) {
  // *************** default value of published status
  const publishedStatusEnum = ['PUBLISHED', 'NOT_PUBLISHED'];

  if (!publishedStatusEnum.includes(publishedStatus)) {
    throw new ApolloError(
      `Published status must be one of: ${publishedStatusEnum}`
    );
  }
}

/**
 * Validates the input for creating or updating a test.
 *
 * Ensures that:
 * - `name` is a non-empty string without special characters.
 * - `description` is a non-empty string.
 * - `weight` is a number between 0 and 1.
 * - `notations` is a non-empty array with valid `notation_text` and `max_point` values.
 *
 * @function ValidateTestInput
 * @param {Object} testInput - The input object for the test.
 * @param {string} testInput.name - The name of the test.
 * @param {string} testInput.description - The description of the test.
 * @param {number} testInput.weight - The weight of the test (must be between 0 and 1).
 * @param {Array<Object>} testInput.notations - Array of notations.
 * @param {string} testInput.notations[].notation_text - The text for each notation.
 * @param {number} testInput.notations[].max_point - The maximum point for each notation.
 *
 * @throws {ApolloError} If any validation rule fails.
 */
function ValidateTestInput(testInput) {
  // *************** validate test name
  if (!testInput.name || typeof testInput.name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('name is required and must be string');
  }

  // *************** validate if name has special character
  const specialRegexCharacter = /[^a-zA-Z0-9\s\-.]/;
  if (specialRegexCharacter.test(testInput.name)) {
    throw new ApolloError(`Name must not contain special character`);
  }

  // *************** validate test description
  if (!testInput.description || typeof testInput.description !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('description is required and must be string');
  }

  // *************** validate test weight
  if (
    typeof testInput.weight !== 'number' ||
    testInput.weight < 0 ||
    testInput.weight > 1
  ) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'weight is required and must be a number between 0 and 1'
    );
  }

  // *************** Validate notations
  if (!Array.isArray(testInput.notations) || !testInput.notations.length) {
    // *************** error message if the input not valid
    throw new ApolloError('Notations is required.');
  }

  testInput.notations.forEach((notation, index) => {
    if (
      typeof notation.notation_text !== 'string' ||
      notation.notation_text.trim() === ''
    ) {
      throw new ApolloError(`notation_text at index ${index} not valid`);
    }

    if (typeof notation.max_point !== 'number' || notation.max_point < 0) {
      throw new ApolloError(`max point at index ${index} not valid`);
    }
  });
}
// *************** EXPORT MODULE ***************
module.exports = { ValidateTestInput, ValidatePublishedStatus };
