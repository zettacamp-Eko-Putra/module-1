// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

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
module.exports = { ValidateTestInput };
