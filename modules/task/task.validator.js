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
function ValidateType(type) {
  // *************** default value of typeTask
  const typeTask = ['ASSIGN_CORRECTOR', 'ENTER_MARKS', 'VALIDATE_MARKS'];

  if (!typeTask.includes(type)) {
    throw new ApolloError(`Type must be one of: ${typeTask.join(', ')}`);
  }
}

/**
 * Utility function to validate task status value.
 *
 * This function ensures that the provided `task_status`
 * is one of the allowed values: `'PENDING'`, `'IN_PROGRESS'`, or `'COMPLETED'`.
 *
 * @function ValidateStatus
 * @param {string} task_status - The status value to be validated.
 *
 * @throws {ApolloError} - Throws an ApolloError if `task_status` is not a valid status.
 */
function ValidateStatus(taskStatus) {
  // *************** default value of taskStatus
  const taskStatusEnum = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

  if (!taskStatusEnum.includes(taskStatus)) {
    throw new ApolloError(
      `Task status must be one of: ${taskStatusEnum.join(', ')}`
    );
  }
}

/**
 * Validates the task input object before updating or creating a task.
 * Ensures the test_id and user_id are valid MongoDB ObjectIds,
 * and that the due_date (if changed) is a future date.
 *
 * @function ValidateTask
 * @param {Object} task_input - Input object containing task data.
 * @param {string} task_input.test_id - ID of the test associated with the task.
 * @param {string} task_input.user_id - ID of the user assigned to the task.
 * @param {string|Date} [task_input.due_date] - Optional due date for the task.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - test_id or user_id is not a valid ObjectId.
 * - due_date is provided and is not a future date.
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
  ValidateType,
  ValidateStatus,
};
