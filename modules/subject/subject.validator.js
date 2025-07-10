// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Validates the input object for creating or updating a subject.
 *
 * @function ValidateSubjectInput
 * @param {Object} subject_input - Input object containing subject details.
 * @param {string} subject_input.name - Name of the subject to validate.
 * @param {string} subject_input.description - Description of the subject to validate.
 * @param {number} subject_input.coefficient - Coefficient value used for evaluation.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - The name is missing, not a string, or contains special characters.
 * - The description is missing or not a string.
 * - The coefficient is missing, not a number, or is negative.
 */
function ValidateSubjectInput(subject_input) {
  // *************** validate subject name
  if (!subject_input.name || typeof subject_input.name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('name is required and must be string');
  }

  // *************** validate if school school_legal_name has special character
  const specialRegexCharacter = /[^a-zA-Z0-9\s\-.]/;
  if (specialRegexCharacter.test(subject_input.name)) {
    throw new ApolloError(`Name must not contain special character`);
  }

  // *************** validate subject description
  if (
    !subject_input.description ||
    typeof subject_input.description !== 'string'
  ) {
    // *************** error message if the input not valid
    throw new ApolloError('description is required and must be string');
  }

  // *************** validate subject description
  if (
    typeof subject_input.coefficient !== 'number' ||
    subject_input.coefficient < 0
  ) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'coefficient is required and must be number and cannot be negative'
    );
  }
}
// *************** EXPORT MODULE ***************
module.exports = { ValidateSubjectInput };
