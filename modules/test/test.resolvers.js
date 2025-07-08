// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.models.js');
const SubjectModel = require('./subject.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateTestInput } = require('./test.validator.js');
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

async function CreateTest(_, { test_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** validate test_input
    ValidateTestInput(test_input);

    // *************** check if subject exists
    const isSubjectExists = await SubjectModel.exists({
      _id: test_input.subject_id,
      status: 'ACTIVE',
    });

    // *************** if subject not exists throw ApolloError
    if (!isSubjectExists) {
      throw new ApolloError('subject not found');
    }

    // *************** Remove leading and trailing spaces from Test name
    const inputName = test_input.name.trim();

    // *************** find exists test name in same subject
    const isTestNameAlreadyExists = await TestModel.exists({
      subject_id: test_input.subject_id,
      name: { $regex: `^${inputName}$`, $options: 'i' },
      status: 'ACTIVE',
    });

    // *************** Throwing error if there's exact name in database
    if (isTestNameAlreadyExists) {
      throw new ApolloError('Test name already exists');
    }

    // *************** prepare test data for database
    const testData = {
      subject_id: test_input.subject_id,
      name: inputName,
      description: test_input.description,
      weight: test_input.weight,
      notations: test_input.notations,
      created_by: user_id,
    };

    // *************** creating new test based on the testData
    const createdTest = await TestModel.create(testData);

    await SubjectModel.updateOne(
      { _id: test_input.subject_id },
      { $push: { test_ids: createdTest._id } }
    );

    // *************** returning new test data
    return createdTest;
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
  Mutation: {
    CreateTest,
  },
};
