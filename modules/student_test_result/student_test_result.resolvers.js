// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.models.js');
const TestModel = require('../test/test.models.js');
const TaskModel = require('../task/task.models.js');

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
    const average = (total / studentTestResult_input.marks.length, toFixed(2));

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
  },
  StudentTestResult: {
    student_id: student_id,
    test_id: test_id,
  },
};
