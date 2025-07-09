// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

function ValidateStudentTestResultInput(StudentTestResult_input) {
  // *************** Validate marks
  if (
    !Array.isArray(StudentTestResult_input.marks) ||
    !StudentTestResult_input.marks.length
  ) {
    // *************** error message if the input not valid
    throw new ApolloError('Marks is required.');
  }

  StudentTestResult_input.marks.forEach((marks, index) => {
    if (
      typeof marks.notation_text !== 'string' ||
      marks.notation_text.trim() === ''
    ) {
      throw new ApolloError(`notation_text at index ${index} not valid`);
    }

    if (typeof marks.mark !== 'number' || marks.mark < 0) {
      throw new ApolloError(`mark at index ${index} not valid`);
    }
  });
}

function ValidateMarksAgainstNotations(marks, notations) {
  const notationMap = {};
  notations.forEach((n) => {
    notationMap[n.notation_text] = n.max_point;
  });

  marks.forEach((markEntry) => {
    const maxPoint = notationMap[markEntry.notation_text];
    if (maxPoint === undefined) {
      throw new ApolloError(
        `Notation "${markEntry.notation_text}" not found in test`
      );
    }
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
