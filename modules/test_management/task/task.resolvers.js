// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TaskModel = require('./task.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../../utilities/common-validator/mongo-validator.js');

async function GetAllTasks(_, { type, task_status }) {
  try {
    // *************** Create filter to find only task with status ACTIVE
    const activeFilter = { status: 'ACTIVE' };

    // *************** Add type to filter if provided by client
    if (type) {
      activeFilter.type = type;
    }

    // *************** Add task_status to filter if provided by client
    if (task_status) {
      activeFilter.task_status = task_status;
    }

    // *************** Find task from database using the filter
    const activeTasks = await TaskModel.find(activeFilter).lean();

    // *************** returning subject data with status ACTIVE
    return activeTasks;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

module.exports = {
    Query:{
        GetAllTasks
    }
}