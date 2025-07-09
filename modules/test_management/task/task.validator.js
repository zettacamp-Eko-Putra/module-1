// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../../utilities/common-validator/mongo-validator.js');

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
