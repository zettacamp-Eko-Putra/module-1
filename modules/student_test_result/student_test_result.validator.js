// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Utility function to validate the validation status value.
 *
 * Ensures that the given `validation_status` is either `'VALIDATED'` or `'NOT_VALIDATED'`.
 *
 * @function ValidateValidationStatus
 * @param {string} validation_status - The validation status string to validate.
 *
 * @throws {ApolloError} - Throws an error if the input is not one of the allowed values.
 */
function ValidateValidationStatus(validation_status) {
  // *************** default value of published status
  const validationStatus = ['VALIDATED', 'NOT_VALIDATED'];

  if (!validationStatus.includes(validation_status)) {
    throw new ApolloError(
      `Validation status must be one of: ${validationStatus}`
    );
  }
}

/**
 * Validates the input object for updating student test result marks.
 *
 * @function ValidateStudentTestResultInput
 * @param {Object} StudentTestResult_input - Input object containing marks.
 * @param {Array<{notation_text: string, mark: number}>} StudentTestResult_input.marks - Array of mark entries to validate.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - `marks` is not an array or is empty.
 * - Any `notation_text` is not a non-empty string.
 * - Any `mark` is not a number or is less than 0.
 */
function ValidateStudentTestResultInput(StudentTestResult_input) {
  // *************** Validate marks
  if (
    !Array.isArray(StudentTestResult_input.marks) ||
    !StudentTestResult_input.marks.length
  ) {
    // *************** error message if the input not valid
    throw new ApolloError('Marks is required.');
  }

  // *************** Validate each marks
  StudentTestResult_input.marks.forEach((marks, index) => {
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
