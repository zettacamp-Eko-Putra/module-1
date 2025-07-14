// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Utility function to validate the published status value.
 *
 * Ensures that the given `published_status` is either `'PUBLISHED'` or `'NOT_PUBLISHED'`.
 *
 * @function ValidatePublishedStatus
 * @param {string} published_status - The status string to validate.
 *
 * @throws {ApolloError} - Throws an error if the input is not one of the allowed values.
 */
function ValidatePublishedStatus(published_status) {
  // *************** default value of published status
  const publishedStatus = ['PUBLISHED', 'NOT_PUBLISHED'];

  if (!publishedStatus.includes(published_status)) {
    throw new ApolloError(
      `Published status must be one of: ${publishedStatus}`
    );
  }
}

/**
 * Utility function to validate test input object.
 *
 * This function validates the structure and data types of a test input object
 * including its name, description, weight, and notations array.
 *
 * Validation Rules:
 * - `name` is required, must be a string, and cannot contain special characters.
 * - `description` is required and must be a string.
 * - `weight` must be a number between 0 and 1.
 * - `notations` must be a non-empty array of objects with:
 *    - `notation_text`: non-empty string.
 *    - `max_point`: non-negative number.
 *
 * @function ValidateTestInput
 * @param {Object} test_input - The input object for creating or updating a test.
 * @param {string} test_input.name - The name of the test.
 * @param {string} test_input.description - The description of the test.
 * @param {number} test_input.weight - The weight of the test (0–1).
 * @param {Array<{ notation_text: string, max_point: number }>} test_input.notations - List of test notations.
 *
 * @throws {ApolloError} - Throws an error if any of the validation rules are violated.
 */
function ValidateTestInput(test_input) {
  // *************** validate test name
  if (!test_input.name || typeof test_input.name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('name is required and must be string');
  }

  // *************** validate if name has special character
  const specialRegexCharacter = /[^a-zA-Z0-9\s\-.]/;
  if (specialRegexCharacter.test(test_input.name)) {
    throw new ApolloError(`Name must not contain special character`);
  }

  // *************** validate test description
  if (!test_input.description || typeof test_input.description !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('description is required and must be string');
  }

  // *************** validate test weight
  if (
    typeof test_input.weight !== 'number' ||
    test_input.weight < 0 ||
    test_input.weight > 1
  ) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'weight is required and must be a number between 0 and 1'
    );
  }

  // *************** Validate notations
  if (!Array.isArray(test_input.notations) || !test_input.notations.length) {
    // *************** error message if the input not valid
    throw new ApolloError('Notations is required.');
  }

  test_input.notations.forEach((notation, index) => {
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
