// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.models.js');
const SubjectModel = require('./subject.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

async function GetAllTests(_, { published_status }) {
  try {
    // *************** Create filter to find only tests with status ACTIVE
    const activeFilter = { status: 'ACTIVE' };

    // *************** Add published_status to filter if provided by client
    if (published_status) {
      activeFilter.published_status = published_status;
    }

    // *************** Find test data from database using the activeFilter
    const activeTests = await TestModel.find(activeFilter).lean();

    // *************** returning subject data with status ACTIVE
    return activeTests;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

async function GetOneTest(_, { _id }) {
  try {
    // *************** Validating test ID
    ValidateIdMongoose(_id, 'GetOneTest');

    // *************** finding test based on id and status ACTIVE
    const test = await TestModel.findOne({
      _id,
      status: 'ACTIVE',
    }).lean();

    // *************** showing message if the test cannot be found
    if (!test) {
      throw new ApolloError('Test Not Found');
    }

    // *************** Return test data if found
    return test;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

module.exports = {
  Query: {
    GetAllTests,
    GetOneTest,
  },
};
