// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

/**
 * Utility function to validate task type value.
 *
 * This function checks whether the given `type` is one of the predefined
 * task types: `'ASSIGN_CORRECTOR'`, `'ENTER_MARKS'`, or `'VALIDATE_MARKS'`.
 *
 * @function ValidateType
 * @param {string} type - The task type to be validated.
 *
 * @throws {ApolloError} - Throws an ApolloError if the `type` is not valid.
 */
function ValidateTaskType(type) {
  // *************** default value of typeTask
  const typeTask = ['ASSIGN_CORRECTOR', 'ENTER_MARKS', 'VALIDATE_MARKS'];

  if (!typeTask.includes(type)) {
    throw new ApolloError(`Type must be one of: ${typeTask.join(', ')}`);
  }
}

/**
 * Validates the task status.
 *
 * Ensures that the provided task status is one of the allowed values:
 * - 'PENDING'
 * - 'IN_PROGRESS'
 * - 'COMPLETED'
 *
 * @function ValidateStatus
 * @param {string} taskStatus - The task status to validate.
 *
 * @throws {ApolloError} If the task status is not one of the allowed values.
 */
function ValidateTaskStatus(taskStatus) {
  // *************** default value of taskStatus
  const taskStatusEnum = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

  if (!taskStatusEnum.includes(taskStatus)) {
    throw new ApolloError(
      `Task status must be one of: ${taskStatusEnum.join(', ')}`
    );
  }
}

/**
 * Validates the input for a Task.
 *
 * This function ensures:
 * - If `test_id` is provided, it must be a valid MongoDB ObjectId.
 * - `user_id` must be a valid MongoDB ObjectId.
 * - If `due_date` is provided, it must be a future date.
 *
 * @function ValidateTaskInput
 * @param {Object} taskInput - The input object for the task.
 * @param {string} [taskInput.test_id] - (Optional) The ID of the test associated with the task.
 * @param {string} taskInput.user_id - The ID of the user assigned to the task.
 * @param {Date|string} [taskInput.due_date] - (Optional) The due date of the task.
 *
 * @throws {ApolloError} If any validation fails.
 */
function ValidateTaskInput(taskInput) {
  // *************** Validate test id
  if (taskInput.test_id) {
    ValidateIdMongoose(taskInput.test_id, 'test_id');
  }

  // *************** Validate test id
  ValidateIdMongoose(taskInput.user_id, 'user_id');

  // *************** Check if due_date is future date
  if (taskInput.due_date) {
    const dueDate = new Date(taskInput.due_date);
    const now = new Date();
    if (dueDate <= now) {
      throw new ApolloError('Due date must be in the future');
    }
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateTaskInput,
  ValidateTaskType,
  ValidateTaskStatus,
};
