// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.models.js');
const SubjectModel = require('../subject/subject.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateTestInput } = require('./test.validator.js');
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

/**
 * Query resolver to retrieve all tests with status "ACTIVE", optionally filtered by published_status.
 *
 * @async
 * @function GetAllTests
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments.
 * @param {string} [args.published_status] - Optional filter to match test's published status (e.g., "PENDING", "PUBLISHED").
 * @returns {Promise<Object[]>} - A Promise that resolves to an array of test objects matching the filter.
 *
 * @throws {ApolloError} - Throws an ApolloError if fetching tests fails.
 */
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

/**
 * Query resolver to retrieve a single test by its ID with status "ACTIVE".
 *
 * @async
 * @function GetOneTest
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments.
 * @param {string} args._id - The ID of the test to retrieve.
 * @returns {Promise<Object>} - A Promise that resolves to the test object if found.
 *
 * @throws {ApolloError} - Throws an ApolloError if the ID is invalid,
 *   the test is not found, or an error occurs during the retrieval.
 */
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

/**
 * Mutation resolver to create a new test under a specific subject.
 *
 * @async
 * @function CreateTest
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {Object} args.test_input - Input object containing test details.
 * @param {string} args.test_input.subject_id - The ID of the subject the test belongs to.
 * @param {string} args.test_input.name - The name of the test.
 * @param {string} args.test_input.description - The description of the test.
 * @param {number} args.test_input.weight - The weight of the test in evaluation.
 * @param {string[]} args.test_input.notations - An array of notation strings for the test.
 * @returns {Promise<Object>} - A Promise that resolves to the newly created test object.
 *
 * @throws {ApolloError} - Throws an ApolloError if validation fails,
 *   the subject is not found, the test name already exists within the same subject,
 *   or an error occurs during creation.
 */
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

/**
 * Mutation resolver to update a test by its ID with new data.
 *
 * @async
 * @function UpdateTest
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the test to update.
 * @param {Object} args.test_input - Input object containing updated test details.
 * @param {string} args.test_input.subject_id - Updated subject ID the test belongs to.
 * @param {string} args.test_input.name - Updated name of the test.
 * @param {string} args.test_input.description - Updated description of the test.
 * @param {number} args.test_input.weight - Updated weight of the test.
 * @param {string[]} args.test_input.notations - Updated notations of the test.
 * @returns {Promise<Object>} - A Promise that resolves to the updated test object.
 *
 * @throws {ApolloError} - Throws an ApolloError if validation fails, the test is not found,
 *   the test is already published, or the test name already exists under the same subject.
 */
async function UpdateTest(_, { _id, test_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** Validating test id and test input
    ValidateIdMongoose(_id, 'UpdateTest');
    ValidateTestInput(test_input);

    // *************** Remove leading and trailing spaces from test name
    const inputName = test_input.name.trim();

    // *************** Find current test by id
    const currentTest = await TestModel.findById(_id).lean();

    // *************** If already published, prevent update
    if (currentTest.published_status === 'PUBLISHED') {
      throw new ApolloError('Test is already published and cannot be edited');
    }

    // *************** Take current test legal name
    const currentTestName = currentTest.name.trim().toLowerCase();

    // *************** Only check duplication if name changed
    if (inputName !== currentTestName) {
      const isTestNameAlreadyExists = await TestModel.exists({
        name: { $regex: `^${inputName}$`, $options: 'i' },
        status: 'ACTIVE',
        subject_id: currentTest.subject_id,
        _id: { $ne: _id },
      });

      if (isTestNameAlreadyExists) {
        throw new ApolloError('Test name already exists');
      }
    }

    // *************** prepare test data for database
    const testData = {
      subject_id: test_input.subject_id,
      name: inputName,
      description: test_input.description,
      weight: test_input.weight,
      notations: test_input.notations,
    };

    // *************** finding test based on id and overwrite it with new data and saving it to database
    const updatedTest = await TestModel.findOneAndUpdate(
      { _id, status: 'ACTIVE' },
      {
        $set: testData,
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
    if (!updatedTest) {
      throw new ApolloError('Test not Found');
    }

    // *************** returning subject updated data to user
    return updatedTest;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Mutation resolver to soft delete a test by setting its status to "DELETED".
 * Only allows deletion if the test is not yet published.
 *
 * @async
 * @function DeleteTest
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the test to delete.
 * @returns {Promise<string>} - A Promise that resolves to the deleted test's ID.
 *
 * @throws {ApolloError} - Throws an ApolloError if the test ID is invalid,
 *   the test is not found or already published, or any error occurs during deletion.
 */
async function DeleteTest(_, { _id }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** checking if the test id is valid
    ValidateIdMongoose(_id, 'DeleteTest');

    // *************** finding test and update the data
    const deleteTest = await TestModel.findOneAndUpdate(
      { _id, status: 'ACTIVE', published_status: 'NOT_PUBLISHED' },
      {
        // *************** changing status field to DELETED and adding timestamp
        status: 'DELETED',
        deleted_by: user_id,
        deleted_at: new Date(),
      },
      { new: true }
    ).lean();

    // *************** showing error message if test already deleted
    if (!deleteTest) {
      throw new ApolloError('Test not found');
    }

    await SubjectModel.updateOne(
      { _id: deleteTest.subject_id },
      { $pull: { test_ids: deleteTest._id } }
    );

    // *************** returning test deleted id to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Field resolver to retrieve subject data for a test based on its subject_id.
 *
 * @async
 * @function subject_id
 * @param {Object} parent - Parent object containing subject_id field.
 * @param {any} _ - Unused GraphQL argument.
 * @param {Object} ctx - GraphQL context containing DataLoader instances.
 * @param {DataLoader<string, Object|null>} ctx.loaders.SubjectLoader - DataLoader for loading subject by ID.
 * @returns {Promise<Object|null>} - A Promise that resolves to the subject object, or null if subject_id is not present.
 */
async function subject_id(parent, _, ctx) {
  // *************** creating if to check if the subject array empty
  if (!parent.subject_id)
    // *************** retuning value if subject array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.SubjectLoader.load(parent.subject_id);
}

module.exports = {
  Query: {
    GetAllTests,
    GetOneTest,
  },
  Mutation: {
    CreateTest,
    UpdateTest,
    DeleteTest,
  },
  Test: {
    subject: subject_id,
  },
};
