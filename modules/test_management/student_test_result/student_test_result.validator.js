// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

function ValidateStudentTestResultInput(StudentTestResult_input) {
  // *************** validate student id
  if (!StudentTestResult_input.student_id) {
    // *************** error message if the input not valid
    throw new ApolloError('student id required and must be valid');
  }
  ValidateIdMongoose(StudentTestResult_input.student_id);

  // *************** validate test id
  if (!StudentTestResult_input.test_id) {
    // *************** error message if the input not valid
    throw new ApolloError('test id required and must be valid');
  }

  ValidateIdMongoose(StudentTestResult_input.test_id);

  if (StudentTestResult_input.task_id) {
    ValidateIdMongoose(StudentTestResult_input.task_id);
  }
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
// *************** EXPORT MODULE ***************
module.exports = { ValidateStudentTestResultInput };
