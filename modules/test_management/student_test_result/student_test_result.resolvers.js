// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.models.js');

// *************** IMPORT VALIDATOR ***************
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

module.exports = {
  Query: {
    GetAllStudentTestResults,
    GetOneStudentTestResult,
  },
};
