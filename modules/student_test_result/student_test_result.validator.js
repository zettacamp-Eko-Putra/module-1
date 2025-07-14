// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Utility function to validate the validation status of a student test result.
 *
 * Allowed values are:
 * - 'VALIDATED'
 * - 'NOT_VALIDATED'
 *
 * @function ValidateValidationStatus
 * @param {string} validationStatus - The validation status to validate.
 *
 * @throws {ApolloError} If the provided status is not one of the allowed values.
 */
function ValidateValidationStatus(validationStatus) {
  // *************** default value of published status
  const validationStatusEnum = ['VALIDATED', 'NOT_VALIDATED'];

  if (!validationStatusEnum.includes(validationStatus)) {
    throw new ApolloError(
      `Validation status must be one of: ${validationStatusEnum}`
    );
  }
}

/**
 * Utility function to validate the input for a Student Test Result.
 *
 * This function ensures that:
 * - `marks` must be a non-empty array.
 * - Each item in `marks` must contain:
 *   - `notation_text`: a non-empty string.
 *   - `mark`: a number that is zero or greater.
 *
 * @function ValidateStudentTestResultInput
 * @param {Object} studentTestResultInput - The input object for student test result.
 * @param {Array<Object>} studentTestResultInput.marks - Array of mark entries.
 * @param {string} studentTestResultInput.marks[].notation_text - Text describing the notation (e.g., "Grammar", "Structure").
 * @param {number} studentTestResultInput.marks[].mark - Score/point for the corresponding notation.
 *
 * @throws {ApolloError} If `marks` is missing, empty, or contains invalid entries.
 */
function ValidateStudentTestResultInput(studentTestResultInput) {
  // *************** Validate marks
  if (
    !Array.isArray(studentTestResultInput.marks) ||
    !studentTestResultInput.marks.length
  ) {
    // *************** error message if the input not valid
    throw new ApolloError('Marks is required.');
  }

  // *************** Validate each marks
  studentTestResultInput.marks.forEach((marks, index) => {
    // *************** Validate if notation text string
    if (
      typeof marks.notation_text !== 'string' ||
      marks.notation_text.trim() === ''
    ) {
      throw new ApolloError(`notation_text at index ${index} not valid`);
    }

    // *************** Validate if mark is number and more than zero
    if (typeof marks.mark !== 'number' || marks.mark < 0) {
      throw new ApolloError(`mark at index ${index} not valid`);
    }
  });
}

/**
 * Validates marks against the corresponding test notations.
 *
 * - Ensures that the number of marks does not exceed the number of notations.
 * - Ensures that each `notation_text` in marks exists in the test notations.
 * - Ensures that each mark is between 0 and the maximum allowed point.
 *
 * @function ValidateMarksAgainstNotations
 * @param {Array<{ notation_text: string, mark: number }>} marks - List of marks to be validated.
 * @param {Array<{ notation_text: string, max_point: number }>} notations - List of test notations with max points.
 *
 * @throws {ApolloError} If:
 * - The number of marks exceeds notations.
 * - A `notation_text` in marks is not found in the notations.
 * - A mark is not within the valid range (0 to max_point).
 */
function ValidateMarksAgainstNotations(marks, notations) {
  // *************** Validate if mark dont exceed notations
  if (marks.length > notations.length) {
    throw new ApolloError('Marks cannot exceed notations');
  }

  const notationMap = {};
  notations.forEach((notation) => {
    notationMap[notation.notation_text] = notation.max_point;
  });

  marks.forEach((markEntry) => {
    const maxPoint = notationMap[markEntry.notation_text];

    // *************** Validate if notation text is valid
    if (maxPoint === undefined) {
      throw new ApolloError(
        `Notation "${markEntry.notation_text}" not found in test`
      );
    }

    // *************** Validate if mark is within valid range
    if (markEntry.mark < 0 || markEntry.mark > maxPoint) {
      throw new ApolloError(
        `Invalid mark for "${markEntry.notation_text}": must be between 0 and ${maxPoint}`
      );
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateStudentTestResultInput,
  ValidateMarksAgainstNotations,
  ValidateValidationStatus,
};
