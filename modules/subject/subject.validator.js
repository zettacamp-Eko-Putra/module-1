// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator');

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

  // *************** validate operator enum
  const logicalOperatorEnum = ['AND', 'OR'];
  if (
    !logicalOperatorEnum.includes(
      subjectInput.passing_criteria.logical_operator
    )
  ) {
    throw new ApolloError(
      `logical_operator must be one of: ${logicalOperatorEnum.join(', ')}`
    );
  }

  const conditionTypeEnum = ['SINGLE_TEST', 'AVERAGE_MARK_TEST'];
  const operatorEnum = ['GREATER_THAN', 'GREATER_THAN_OR_EQUAL'];

  subjectInput.passing_criteria.condition.forEach((condition, index) => {
    const { condition_type, test_id, min_mark, operator } = condition;

    // *************** validate condition_type
    if (!conditionTypeEnum.includes(condition_type)) {
      throw new ApolloError(
        `condition_type at index ${index} must be one of: ${conditionTypeEnum.join(
          ', '
        )}`
      );
    }

    // *************** test id
    if (test_id) ValidateIdMongoose(test_id, `test_id at index ${index}`);

    // *************** validate min_mark
    if (typeof min_mark !== 'number' || min_mark < 0) {
      throw new ApolloError(
        `min_mark at index ${index} must be a non-negative number`
      );
    }

    // *************** validate operator enum
    if (!operatorEnum.includes(operator)) {
      throw new ApolloError(
        `operator at index ${index} must be one of: ${operatorEnum.join(', ')}`
      );
    }
  });
}
// *************** EXPORT MODULE ***************
module.exports = { ValidateSubjectInput };
