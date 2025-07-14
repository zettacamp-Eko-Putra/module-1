// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Validates the input for a Subject.
 *
 * This function checks that:
 * - `name` is a non-empty string and does not contain special characters.
 * - `description` is a non-empty string.
 * - `coefficient` is a non-negative number.
 *
 * @function ValidateSubjectInput
 * @param {Object} subjectInput - The input object for the subject.
 * @param {string} subjectInput.name - The name of the subject.
 * @param {string} subjectInput.description - The description of the subject.
 * @param {number} subjectInput.coefficient - The coefficient of the subject.
 *
 * @throws {ApolloError} If any of the validations fail.
 */
function ValidateSubjectInput(subjectInput) {
  // *************** validate subject name
  if (!subjectInput.name || typeof subjectInput.name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('name is required and must be string');
  }

  // *************** validate if school school_legal_name has special character
  const specialRegexCharacter = /[^a-zA-Z0-9\s\-.]/;
  if (specialRegexCharacter.test(subjectInput.name)) {
    throw new ApolloError(`Name must not contain special character`);
  }

  // *************** validate subject description
  if (
    !subjectInput.description ||
    typeof subjectInput.description !== 'string'
  ) {
    // *************** error message if the input not valid
    throw new ApolloError('description is required and must be string');
  }

  // *************** validate subject description
  if (
    !subjectInput.coefficient ||
    typeof subjectInput.coefficient !== 'number' ||
    subjectInput.coefficient < 0
  ) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'coefficient is required and must be number and cannot be negative'
    );
  }
}
// *************** EXPORT MODULE ***************
module.exports = { ValidateSubjectInput };
