// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

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
function ValidateTask(task_input) {
  // *************** Validate test id
  ValidateIdMongoose(task_input.test_id);

  // *************** Validate test id
  ValidateIdMongoose(task_input.user_id);

  // *************** Check if due_date is changed and still in the future
  if (
    task_input.due_date &&
    new Date(task_input.due_date).getTime() !==
      new Date(currentTask.due_date).getTime()
  ) {
    const now = new Date();
    const dueDate = new Date(task_input.due_date);
    if (dueDate <= now) {
      throw new ApolloError('Due date must be in the future');
    }
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  ValidateTask,
};
