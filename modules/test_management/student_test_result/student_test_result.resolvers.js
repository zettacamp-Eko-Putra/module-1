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

module.exports = {
  Query: {
    GetAllStudentTestResults,
  },
};
