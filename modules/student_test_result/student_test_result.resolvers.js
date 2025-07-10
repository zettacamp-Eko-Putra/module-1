// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.models.js');
const TestModel = require('../test/test.models.js');
const TaskModel = require('../task/task.models.js');
const UserModel = require('../user/user.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateStudentTestResultInput,
} = require('./student_test_result.validator.js');
const {
  ValidateMarksAgainstNotations,
} = require('./student_test_result.validator.js');
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

/**
 * Query resolver to retrieve all student test results with status "ACTIVE",
 * optionally filtered by validation status.
 *
 * @async
 * @function GetAllStudentTestResults
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments.
 * @param {string} [args.validation_status] - Optional filter to match the validation status of the results.
 * @returns {Promise<Object[]>} - A Promise that resolves to an array of student test result objects.
 *
 * @throws {ApolloError} - Throws an ApolloError if fetching student test results fails.
 */
async function GetAllStudentTestResults(_, { validation_status }) {
  try {
    // *************** Create filter to student test results only student test results with status ACTIVE
    const activeFilter = { status: 'ACTIVE' };

    // *************** Add validation_status to filter if provided
    if (validation_status) {
      activeFilter.validation_status = validation_status;
    }

    // *************** Find student test results from database using the filter
    const activeStudentTestResults = await StudentTestResultModel.find(
      activeFilter
    ).lean();

    // *************** returning subject data with status ACTIVE
    return activeStudentTestResults;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Query resolver to retrieve a single student test result by its ID with status "ACTIVE".
 *
 * @async
 * @function GetOneStudentTestResult
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments.
 * @param {string} args._id - The ID of the student test result to retrieve.
 * @returns {Promise<Object>} - A Promise that resolves to the student test result object if found.
 *
 * @throws {ApolloError} - Throws an ApolloError if the ID is invalid,
 *   the student test result is not found, or an error occurs during retrieval.
 */
async function GetOneStudentTestResult(_, { _id }) {
  try {
    // *************** Validating student test result ID
    ValidateIdMongoose(_id, 'GetOneStudentTestResult');

    // *************** finding student test result based on id and status ACTIVE
    const studentTestResult = await StudentTestResultModel.findOne({
      _id,
      status: 'ACTIVE',
    }).lean();

    // *************** showing message if the student test result cannot be found
    if (!studentTestResult) {
      throw new ApolloError('student test result not Found');
    }

    // *************** Return student test result data if found
    return studentTestResult;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Mutation resolver to update marks for a student test result.
 * Also updates task status if all marks are entered, and creates a validation task.
 *
 * @async
 * @function UpdateMarksForStudentTestResult
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the student test result to update.
 * @param {Object} args.studentTestResult_input - Input object containing the updated marks.
 * @param {Array<{ notation: string, mark: number }>} args.studentTestResult_input.marks - Array of marks to be saved.
 * @returns {Promise<Object>} - A Promise that resolves to the updated student test result object.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - The `_id` is invalid.
 * - The student test result is not found or already validated.
 * - The related test is not found.
 * - The marks do not match the test notations.
 * - An error occurs during update or task handling.
 */
async function UpdateMarksForStudentTestResult(
  _,
  { _id, studentTestResult_input }
) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** Validating test id and student test result input
    ValidateIdMongoose(_id, 'UpdateStudentTestResult');
    ValidateStudentTestResultInput(studentTestResult_input);

    // *************** Find current student Test Result by id
    const currentStudentTestResult = await StudentTestResultModel.findOne({
      _id,
      status: 'ACTIVE',
      validation_status: 'NOT_VALIDATED',
    }).lean();

    if (!currentStudentTestResult) {
      throw new ApolloError('Student test result not found');
    }

    const test = await TestModel.findById(
      currentStudentTestResult.test_id
    ).lean();

    if (!test) {
      throw new ApolloError('Test not found');
    }

    // *************** validate mark against notations
    ValidateMarksAgainstNotations(
      studentTestResult_input.marks,
      test.notations
    );

    // *************** get total mark value
    const total = studentTestResult_input.marks.reduce(
      (sum, markEntry) => sum + markEntry.mark,
      0
    );

    // *************** count average
    const average = (total / studentTestResult_input.marks.length).toFixed(2);

    // *************** save marks and the average
    const studentTestResultData = {
      marks: studentTestResult_input.marks,
      average_mark: average,
      mark_entry_date: new Date(),
    };

    // *************** Check if all marks entered
    if (studentTestResult_input.marks.length === test.notations.length) {
      studentTestResultData.mark_entry_date = new Date();

      // *************** Update ENTER_MARKS task to COMPLETED
      await TaskModel.findOneAndUpdate(
        {
          _id: currentStudentTestResult.task_id,
          type: 'ENTER_MARKS',
          status: 'ACTIVE',
          task_status: 'IN_PROGRESS',
        },
        { task_status: 'COMPLETED' }
      );

      // *************** Create new VALIDATE_MARKS task
      await TaskModel.create({
        type: 'VALIDATE_MARKS',
        user_id: currentStudentTestResult.mark_validator_id,
      });
    }

    // *************** finding student test result based on criteria and overwrite it with new data and saving it to database
    const updatedStudentTestResult =
      await StudentTestResultModel.findOneAndUpdate(
        { _id, status: 'ACTIVE', validation_status: 'NOT_VALIDATED' },
        {
          $set: studentTestResultData,
          $push: {
            updated_by: {
              user_id: user_id,
              updated_at: new Date(),
            },
          },
        },
        { new: true }
      ).lean();

    // ***************  showing error message if the Student test result cannot be found in database
    if (!updatedStudentTestResult) {
      throw new ApolloError('Student test result not Found');
    }

    // *************** returning subject updated data to user
    return updatedStudentTestResult;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Mutation resolver to soft delete a student test result by setting its status to "DELETED".
 * Only allows deletion if the result is not yet validated.
 *
 * @async
 * @function DeleteStudentTestResult
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the student test result to delete.
 * @returns {Promise<string>} - A Promise that resolves to the deleted student test result's ID.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - The ID is invalid.
 * - The student test result is not found or already validated/deleted.
 * - An error occurs during the deletion process.
 */
async function DeleteStudentTestResult(_, { _id }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** checking if the Student test Result id is valid
    ValidateIdMongoose(_id, 'DeleteStudentTestResult');

    // *************** finding Student test Result and update the data
    const DeleteStudentTestResult =
      await StudentTestResultModel.findOneAndUpdate(
        { _id, status: 'ACTIVE', validation_status: 'NOT_VALIDATED' },
        {
          // *************** changing status field to DELETED and adding timestamp
          status: 'DELETED',
          deleted_by: user_id,
          deleted_at: new Date(),
        }
      ).lean();

    // *************** showing error message if Student test Result already deleted
    if (!DeleteStudentTestResult) {
      throw new ApolloError('Student test Result not found');
    }

    // *************** returning test deleted id to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Mutation resolver to enter marks for a student on a specific test.
 * Validates all related IDs, ensures test and student combination is unique,
 * checks mark validity, calculates average, stores result,
 * and updates task status or creates a VALIDATE_MARKS task if complete.
 *
 * @async
 * @function EnterMarksForStudentTestResult
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - ID of the ENTER_MARKS task being performed.
 * @param {Object} args.task_input - Object containing all required inputs for entering marks.
 * @param {string} args.task_input.test_id - The test ID for which marks are entered.
 * @param {string} args.task_input.user_id - The user ID of the corrector.
 * @param {string} args.task_input.student_id - The student ID receiving the marks.
 * @param {Array<{notation_text: string, mark: number}>} args.task_input.marks - List of marks with notation.
 * @returns {Promise<string>} - The ID of the next task (VALIDATE_MARKS) if completed, or current ENTER_MARKS task.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - Any ID is invalid (task_id, test_id, user_id, student_id).
 * - Task not found or not active.
 * - Combination of test and student already exists and validated.
 * - Assigned user does not exist or is not active.
 * - Test not found or not in PUBLISHED status.
 * - Number of marks exceeds notations.
 * - Mark value is out of allowed range or notation is not recognized.
 */
async function EnterMarksForStudentTestResult(_, { _id, task_input }) {
  // *************** get one user
  const userIdCreate = '686b93d2cb55171e10da8c00';

  // *************** validate id input
  ValidateIdMongoose(_id);
  ValidateIdMongoose(task_input.test_id, 'test_id');
  ValidateIdMongoose(task_input.user_id, 'user_id');
  ValidateIdMongoose(task_input.student_id, 'student_id');

  // *************** get task based on criteria
  const taskData = await TaskModel.findOne({
    _id: _id,
    type: 'ENTER_MARKS',
    task_status: 'PENDING',
    status: 'ACTIVE',
  });

  if (!taskData) {
    throw new ApolloError('Task not found');
  }

  // *************** check if there student and test combination
  const isStudentTestResultCombiationExists =
    await StudentTestResultModel.exists({
      test_id: task_input.test_id,
      student_id: task_input.student_id,
      status: 'ACTIVE',
      validation_status: 'VALIDATED',
    });

  if (isStudentTestResultCombiationExists) {
    throw new ApolloError('Combination test and student already exists');
  }

  // *************** check user exists in database
  const isUserExists = await UserModel.exists({
    _id: task_input.user_id,
    status: 'active',
  });

  if (!isUserExists) {
    throw new ApolloError('User not found');
  }

  // *************** get test data based on criteria
  const testData = await TestModel.findOne({
    _id: task_input.test_id,
    status: 'ACTIVE',
    published_status: 'PUBLISHED',
  });

  if (!testData) {
    throw new ApolloError('Test not found');
  }

  // *************** validate marks count
  const notations = testData.notations;
  if (task_input.marks.length > notations.length) {
    throw new ApolloError('Number of marks must not exceed notations');
  }

  // *************** validate individual marks
  for (const markEntry of task_input.marks) {
    const notation = notations.find(
      (n) => n.notation_text === markEntry.notation_text
    );
    if (!notation) {
      throw new ApolloError(
        `Notation '${markEntry.notation_text}' not found in test`
      );
    }
    if (markEntry.mark < 0 || markEntry.mark > notation.max_point) {
      throw new ApolloError(
        `Invalid mark for ${markEntry.notation_text}: must be between 0 and ${notation.max_point}`
      );
    }
  }

  // *************** calculate average
  const total = task_input.marks.reduce(
    (sum, markEntry) => sum + markEntry.mark,
    0
  );
  const average = (total / task_input.marks.length).toFixed(2);

  // *************** build student test result
  const newStudentTestResult = new StudentTestResultModel({
    student_id: task_input.student_id,
    test_id: task_input.test_id,
    task_id: _id,
    mark_validator_id: task_input.user_id,
    marks: task_input.marks,
    average_mark: average,
    mark_entry_date: new Date(),
    created_by: userIdCreate,
  });

  // *************** save result
  await newStudentTestResult.save();

  // *************** determine if task is completed
  const isComplete = task_input.marks.length === notations.length;

  taskData.task_status = isComplete ? 'COMPLETED' : 'IN_PROGRESS';
  taskData.updated_by.push({
    user_id: userIdCreate,
    updated_at: new Date(),
  });

  await taskData.save();

  // *************** if task is completed, create VALIDATE_MARKS task
  if (isComplete) {
    const validateTask = new TaskModel({
      test_id: task_input.test_id,
      user_id: task_input.user_id,
      type: 'VALIDATE_MARKS',
      created_at: new Date(),
      created_by: userIdCreate,
    });
    await validateTask.save();

    return validateTask._id;
  }

  // *************** if not completed, return current task
  return taskData._id;
}

/**
 * Mutation resolver to validate a student's test result and complete the associated validation task.
 * Updates the student test result's `validation_status` to `VALIDATED` and sets the task status to `COMPLETED`.
 *
 * @async
 * @function ValidateMarks
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the VALIDATE_MARKS task to be marked as completed.
 * @param {Object} args.task_input - Input object containing the student test result ID.
 * @param {string} args.task_input.studentTestResult_id - The ID of the student test result to validate.
 * @returns {Promise<string>} - A Promise that resolves to the task ID after successful completion.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - Either `_id` or `studentTestResult_id` is not a valid MongoDB ObjectId.
 * - The student test result is not found or already validated.
 * - The task is not found, not active, or not in PENDING status.
 */
async function ValidateMarks(_, { _id, task_input }) {
  // *************** validate id and input id
  ValidateIdMongoose(_id);
  ValidateIdMongoose(task_input.studentTestResult_id);

  // *************** student test result data
  const getStudentTestResultData = await StudentTestResultModel.findOne({
    _id: task_input.studentTestResult_id,
    status: 'ACTIVE',
    validation_status: 'NOT_VALIDATED',
  });

  if (!getStudentTestResultData) {
    throw new ApolloError('Student test result not found');
  }

  // *************** get task data
  const getTaskData = await TaskModel.findOne({
    _id: _id,
    type: 'VALIDATE_MARKS',
    status: 'ACTIVE',
    task_status: 'PENDING',
  });
  if (!getTaskData) {
    throw new ApolloError('Task not found');
  }

  // *************** update student test result
  await StudentTestResultModel.updateOne(
    { _id: task_input.studentTestResult_id },
    { validation_status: 'VALIDATED' }
  );

  // *************** update task
  await TaskModel.updateOne({ _id }, { task_status: 'COMPLETED' });

  return _id;
}

/**
 * Field resolver to retrieve student data for a student test result based on its student_id.
 *
 * @async
 * @function student_id
 * @param {Object} parent - Parent object containing student_id field.
 * @param {any} _ - Unused GraphQL argument.
 * @param {Object} ctx - GraphQL context containing DataLoader instances.
 * @param {DataLoader<string, Object|null>} ctx.loaders.StudentLoader - DataLoader for loading student by ID.
 * @returns {Promise<Object|null>} - A Promise that resolves to the student object, or null if student_id is not present.
 */
async function student_id(parent, _, ctx) {
  // *************** creating if to check if the student array empty
  if (!parent.student_id)
    // *************** retuning value if student array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.StudentLoader.load(parent.student_id);
}

/**
 * Field resolver to retrieve test data for a student test result based on its test_id.
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
  // *************** creating if to check if the test array empty
  if (!parent.test_id)
    // *************** retuning value if test array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.TestLoader.load(parent.test_id);
}

module.exports = {
  Query: {
    GetAllStudentTestResults,
    GetOneStudentTestResult,
  },
  Mutation: {
    UpdateMarksForStudentTestResult,
    DeleteStudentTestResult,
    EnterMarksForStudentTestResult,
    ValidateMarks,
  },
  StudentTestResult: {
    student_id: student_id,
    test_id: test_id,
  },
};
