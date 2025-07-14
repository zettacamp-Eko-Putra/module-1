// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TaskModel = require('./task.models.js');
const UserModel = require('../user/user.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');
const { ValidateTaskInput } = require('./task.validator.js');
const { ValidateType } = require('./task.validator.js');
const { ValidateStatus } = require('./task.validator.js');

// *************** GLOBAL VARIABLE ***************
const defaultUser = process.env.DEFAULT_USER_ID;

// *************** QUERY ***************
/**
 * Query resolver to retrieve all tasks with status "ACTIVE",
 * optionally filtered by task type and task status.
 *
 * @async
 * @function GetAllTasks
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments.
 * @param {string} [args.type] - Optional filter to match task type (e.g., "ENTER_MARKS", "VALIDATE_MARKS").
 * @param {string} [args.task_status] - Optional filter to match task status (e.g., "PENDING", "IN_PROGRESS", "COMPLETED").
 * @returns {Promise<Object[]>} - A Promise that resolves to an array of task objects.
 *
 * @throws {ApolloError} - Throws an ApolloError if fetching tasks fails.
 */
async function GetAllTasks(_, { type, task_status }) {
  try {
    // *************** Validate type and status
    if (type) ValidateType(type);
    if (task_status) ValidateStatus(task_status);

    // *************** Create filter to find only task with status ACTIVE
    const filter = { status: 'ACTIVE' };

    // *************** Add type to filter if provided
    if (type) {
      filter.type = type;
    }

    // *************** Add task_status to filter if provided
    if (task_status) {
      filter.task_status = task_status;
    }

    // *************** Find task from database using the filter
    const activeTasks = await TaskModel.find(filter).lean();

    // *************** returning task data with status ACTIVE
    return activeTasks;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Query resolver to retrieve a single task by its ID with status "ACTIVE".
 *
 * @async
 * @function GetOneTask
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments.
 * @param {string} args._id - The ID of the task to retrieve.
 * @returns {Promise<Object>} - A Promise that resolves to the task object if found.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - The ID is invalid.
 * - The task with the given ID and status "ACTIVE" is not found.
 * - Any unexpected error occurs during retrieval.
 */
async function GetOneTask(_, { _id }) {
  try {
    // *************** Validating task ID
    ValidateIdMongoose(_id, '_id');

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

// *************** MUTATION ***************
/**
 * Mutation resolver to update task details such as test ID, user assignment, and due date.
 * Ensures the task exists and is still pending, and the assigned user is active.
 *
 * @async
 * @function UpdateTask
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the task to be updated.
 * @param {Object} args.task_input - Input data for updating the task.
 * @param {string} args.task_input.test_id - The ID of the test associated with the task.
 * @param {string} args.task_input.user_id - The ID of the user assigned to the task.
 * @param {Date} args.task_input.due_date - The due date for the task.
 * @returns {Promise<Object>} - A Promise that resolves to the updated task data.
 *
 * @throws {ApolloError} - Throws if:
 * - The task ID or input is invalid.
 * - The task is not found or is not in pending status.
 * - The user does not exist or is not active.
 */
async function UpdateTask(_, { _id, task_input }) {
  try {
    // *************** Validating test id and Task input
    ValidateIdMongoose(_id, '_id');
    ValidateTaskInput(task_input);

    // *************** Check if task exists
    const isTaskExists = await TaskModel.exists({
      _id,
      status: 'ACTIVE',
      task_status: 'PENDING',
    });

    if (!isTaskExists) {
      throw new ApolloError('Task not found');
    }

    // *************** Find new user exists
    const isNewUserExists = await UserModel.exists({
      _id: task_input.user_id,
      status: 'active',
    });

    if (!isNewUserExists) {
      throw new ApolloError('New user not found');
    }

    // *************** breakdown Task input
    const taskData = {
      test_id: task_input.test_id,
      user_id: task_input.user_id,
      due_date: task_input.due_date,
    };

    // *************** finding Task based on id and overwrite it with new data and saving it to database
    const updatedTask = await TaskModel.findByIdAndUpdate(
      _id,
      {
        $set: taskData,
        $push: {
          updated_by: {
            user_id: defaultUser,
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

/**
 * Mutation resolver to soft delete a task by setting its status to "DELETED".
 * Only allows deletion if the task is still in "PENDING" status.
 *
 * @async
 * @function DeleteTask
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the task to delete.
 * @returns {Promise<string>} - A Promise that resolves to the ID of the deleted task.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - The task ID is invalid.
 * - The task is not found, not active, or not in "PENDING" status.
 * - An error occurs during the deletion process.
 */
async function DeleteTask(_, { _id }) {
  try {
    // *************** checking if the Task id is valid
    ValidateIdMongoose(_id, '_id');

    // *************** finding Task and update the data
    const deleteTask = await TaskModel.findOneAndUpdate(
      { _id, status: 'ACTIVE', task_status: 'PENDING' },
      {
        // *************** changing status field to DELETED and adding timestamp
        status: 'DELETED',
        deleted_by: defaultUser,
        deleted_at: new Date(),
      }
    ).lean();

    // *************** showing error message if Task already deleted
    if (!deleteTask) {
      throw new ApolloError('Task not found');
    }

    // *************** returning task deleted id to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************
/**
 * Field resolver to retrieve test data for a task based on its test_id.
 *
 * @async
 * @function test_id
 * @param {Object} parent - Parent object containing test_id field.
 * @param {any} _ - Unused GraphQL argument.
 * @param {Object} ctx - GraphQL context containing DataLoader instances.
 * @param {DataLoader<string, Object|null>} ctx.loaders.TestLoader - DataLoader for loading test by ID.
 * @returns {Promise<Object|null>} - A Promise that resolves to the test object, or null if test_id is not present.
 */
async function test_id(parent, _, ctx) {
  // *************** creating if to check if the test_id array empty
  if (!parent.test_id)
    // *************** retuning value if test_id array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.TestLoader.load(parent.test_id);
}

/**
 * Field resolver to retrieve user data for a task based on its user_id.
 *
 * @async
 * @function user_id
 * @param {Object} parent - Parent object containing user_id field.
 * @param {any} _ - Unused GraphQL argument.
 * @param {Object} ctx - GraphQL context containing DataLoader instances.
 * @param {DataLoader<string, Object|null>} ctx.loaders.UserLoader - DataLoader for loading user by ID.
 * @returns {Promise<Object|null>} - A Promise that resolves to the user object, or null if user_id is not present.
 */
async function user_id(parent, _, ctx) {
  // *************** creating if to check if the user_id array empty
  if (!parent.user_id)
    // *************** retuning value if user_id array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.UserLoader.load(parent.user_id);
}

// *************** EXPORT MODULE ***************
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
