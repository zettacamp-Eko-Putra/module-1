// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TaskModel = require('./task.models.js');
const UserModel = require('../user/user.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

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

async function GetOneTask(_, { _id }) {
  try {
    // *************** Validating task ID
    ValidateIdMongoose(_id, 'GetOneTask');

    // *************** finding task based on id and status ACTIVE
    const taskResult = await TaskModel.findOne({
      _id,
      status: 'ACTIVE',
    }).lean();

    // *************** showing message if the task cannot be found
    if (!taskResult) {
      throw new ApolloError('Task not Found');
    }

    // *************** Return task data if found
    return taskResult;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

async function UpdateTask(_, { _id, task_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** Validating test id and Task input
    ValidateIdMongoose(_id, 'UpdateTask');
    ValidateTaskInput(task_input);

    // *************** Find current Task by id
    const currentTask = await TaskModel.findOne({
      _id,
      status: 'ACTIVE',
      task_status: 'PENDING',
    }).lean();

    if (!currentTask) {
      throw new ApolloError('Task not found');
    }

    const isNewUserInDatabase = await UserModel.exists({
      _id: task_input.user_id,
      status: 'ACTIVE',
    });

    if (!isNewUserInDatabase) {
      throw new ApolloError('New user not found');
    }

    // *************** breakdown Task input
    const taskData = {
      test_id: task_input.test_id,
      user_id: task_input.user_id,
      due_date: task_input.due_date,
    };

    // *************** finding Task based on id and overwrite it with new data and saving it to database
    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id, status: 'ACTIVE', task_status: 'PENDING' },
      {
        $set: taskData,
        $push: {
          updated_by: {
            user_id: user_id,
            updated_at: new Date(),
          },
        },
      },
      { new: true }
    ).lean();

    // ***************  showing error message if the Task id cannot be found in database
    if (!updatedTask) {
      throw new ApolloError('Task not Found');
    }

    // *************** returning Task updated data to user
    return updatedTask;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

async function DeleteTask(_, { _id }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** checking if the Task id is valid
    ValidateIdMongoose(_id, 'DeleteTask');

    // *************** finding Task and update the data
    const deleteTask = await TaskModel.findOneAndUpdate(
      { _id, status: 'ACTIVE', task_status: 'PENDING' },
      {
        // *************** changing status field to DELETED and adding timestamp
        status: 'DELETED',
        deleted_by: user_id,
        deleted_at: new Date(),
      }
    ).lean();

    // *************** showing error message if Task already deleted
    if (!deleteTask) {
      throw new ApolloError('Task not found');
    }

    // *************** returning test deleted id to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

async function test_id(parent, _, ctx) {
  // *************** creating if to check if the subject array empty
  if (!parent.test_id)
    // *************** retuning value if subject array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.TestLoader.load(parent.test_id);
}

async function user_id(parent, _, ctx) {
  // *************** creating if to check if the subject array empty
  if (!parent.user_id)
    // *************** retuning value if subject array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.UserLoader.load(parent.user_id);
}

module.exports = {
  Query: {
    GetAllTasks,
    GetOneTask,
  },
  Mutation: {
    UpdateTask,
    DeleteTask,
  },
  Task: {
    user: user_id,
    test: test_id,
  },
};
