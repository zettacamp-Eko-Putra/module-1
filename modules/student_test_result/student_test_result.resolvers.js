// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.models.js');
const TestModel = require('../test/test.models.js');

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

async function GetAllStudentTestResults(_, { validation_status }) {
  try {
    // *************** Create filter to find only tests with status ACTIVE
    const activeFilter = { status: 'ACTIVE' };

    // *************** Add validation_status to filter if provided by client
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

    // *************** Check if marks have changed
    const marksChanged =
      JSON.stringify(currentStudentTestResult.marks) !==
      JSON.stringify(studentTestResult_input.marks);

    // *************** always count average
    const total = studentTestResult_input.marks.reduce(
      (sum, markEntry) => sum + markEntry.mark,
      0
    );
    const average = total / studentTestResult_input.marks.length;

    // *************** Simpan marks dan average
    const studentTestResultData = {
      marks: studentTestResult_input.marks,
      average_mark: parseFloat(average.toFixed(2)),
    };

    // *************** Check if all marks entered (complete entry)
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

    // *************** finding test based on id and overwrite it with new data and saving it to database
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

    // ***************  showing error message if the subject id cannot be found in database
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

async function student_id(parent, _, ctx) {
  // *************** creating if to check if the subject array empty
  if (!parent.student_id)
    // *************** retuning value if subject array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.StudentLoader.load(parent.student_id);
}

async function test_id(parent, _, ctx) {
  // *************** creating if to check if the subject array empty
  if (!parent.test_id)
    // *************** retuning value if subject array empty
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
