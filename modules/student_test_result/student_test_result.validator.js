// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

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
 * Validates that each mark entry corresponds to a valid notation
 * and does not exceed the maximum point defined for that notation.
 *
 * @function ValidateMarksAgainstNotations
 * @param {Array<{notation_text: string, mark: number}>} marks - Array of mark entries to validate.
 * @param {Array<{notation_text: string, max_point: number}>} notations - Array of available notations and their max points.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - A `notation_text` in marks is not found in the test's notations.
 * - A `mark` exceeds the corresponding notation's max point.
 */
function ValidateMarksAgainstNotations(marks, notations) {
  const notationMap = {};
  notations.forEach((n) => {
    notationMap[n.notation_text] = n.max_point;
  });

  marks.forEach((markEntry) => {
    const maxPoint = notationMap[markEntry.notation_text];
    // *************** Validate if notation text same with input
    if (maxPoint === undefined) {
      throw new ApolloError(
        `Notation "${markEntry.notation_text}" not found in test`
      );
    }
    // *************** Validate if mark not exceed max point
    if (markEntry.mark > maxPoint) {
      throw new ApolloError(
        `Mark for "${markEntry.notation_text}" cannot exceed ${maxPoint}`
      );
    }
  });
}
// *************** EXPORT MODULE ***************
module.exports = {
  ValidateStudentTestResultInput,
  ValidateMarksAgainstNotations,
};
