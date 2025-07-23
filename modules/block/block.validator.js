// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator');

/**
 * Utility function to validate input object for creating or updating a Block.
 *
 * This function ensures that:
 * - The `name` field exists, is a string, and contains no special characters.
 * - The `description` field exists and is a string.
 *
 * @function ValidateBlockInput
 * @param {Object} blockInput - The input object for the Block.
 * @param {string} blockInput.name - The name of the Block.
 * @param {string} blockInput.description - The description of the Block.
 *
 * @throws {ApolloError} If any required field is missing or invalid.
 */
function ValidateBlockInput(blockInput) {
  // *************** validate block name
  if (!blockInput.name || typeof blockInput.name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('name is required and must be string');
  }

  // *************** validate if school school_legal_name has special character
  const specialRegexCharacter = /[^a-zA-Z0-9\s\-.]/;
  if (specialRegexCharacter.test(blockInput.name)) {
    throw new ApolloError(`Name must not contain special character`);
  }

  // *************** validate block description
  if (!blockInput.description || typeof blockInput.description !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('description is required and must be string');
  }

  // *************** validate logical operator
  const logicalOperatorEnum = ['AND', 'OR'];
  if (
    !logicalOperatorEnum.includes(blockInput.passing_criteria.logical_operator)
  ) {
    throw new ApolloError(
      `logical_operator must be one of: ${logicalOperatorEnum.join(', ')}`
    );
  }

  // *************** prepare condition enum
  const conditionTypeEnum = [
    'SINGLE_SUBJECT',
    'AVERAGE_MARK_SUBJECT',
    'SINGLE_TEST',
  ];

  // *************** prepare operator enum
  const operatorEnum = ['GREATER_THAN', 'GREATER_THAN_OR_EQUAL'];

  // *************** validate each condition in passing criteria
  blockInput.passing_criteria.condition.forEach((condition, index) => {
    const { condition_type, subject_id, test_id, min_mark, operator } =
      condition;

    // *************** validate condition type
    if (!conditionTypeEnum.includes(condition_type)) {
      throw new ApolloError(
        `condition_type at index ${index} must be one of: ${conditionTypeEnum.join(
          ', '
        )}`
      );
    }

    if (subject_id) ValidateIdMongoose(subject_id, 'subject_id');
    if (test_id) ValidateIdMongoose(test_id, 'test_id');

    if (typeof min_mark !== 'number' || min_mark < 0) {
      throw new ApolloError(
        `min_mark at index ${index} must be a positive number`
      );
    }

    if (!operatorEnum.includes(operator)) {
      throw new ApolloError(
        `operator at index ${index} must be one of: ${operatorEnum.join(', ')}`
      );
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateBlockInput };
