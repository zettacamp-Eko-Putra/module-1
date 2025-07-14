// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
const SendEmail = require('../../utilities/send-email');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.models.js');
const SubjectModel = require('../subject/subject.models.js');
const TaskModel = require('../task/task.models.js');
const UserModel = require('../user/user.models.js');
const StudentModel = require('../student/student.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateTestInput } = require('./test.validator.js');
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

// *************** GLOBAL VARIABLE
const defaultUser = process.env.DEFAULT_USER_ID;

// *************** QUERY ***************
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
    ValidateIdMongoose(_id, '_id');

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

// *************** MUTATION ***************
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
      created_by: defaultUser,
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
    // *************** Validating test id and test input
    ValidateIdMongoose(_id, '_id');
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
            user_id: defaultUser,
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
    // *************** checking if the test id is valid
    ValidateIdMongoose(_id, '_id');

    // *************** finding test and update the data
    const deleteTest = await TestModel.findOneAndUpdate(
      { _id, status: 'ACTIVE', published_status: 'NOT_PUBLISHED' },
      {
        // *************** changing status field to DELETED and adding timestamp
        status: 'DELETED',
        deleted_by: defaultUser,
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
 * Mutation resolver to publish a test by updating its status and creating an ASSIGN_CORRECTOR task.
 * Ensures the test exists, is not already published, and the assigned user is valid and active.
 *
 * @async
 * @function PublishTest
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {Object} args.task_input - Input data for publishing the test.
 * @param {string} args.task_input.test_id - The ID of the test to publish.
 * @param {string} args.task_input.user_id - The ID of the user to assign as corrector.
 * @returns {Promise<string>} - A Promise that resolves to the published test ID.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - The test or user ID is invalid.
 * - The test is not found or already published.
 * - The assigned user does not exist or is not active.
 */
async function PublishTest(_, { task_input }) {
  try {
    // *************** validating test_id and user_id
    ValidateIdMongoose(task_input.test_id, 'test_id');
    ValidateIdMongoose(task_input.user_id, 'user_id');

    // *************** find the test with status ACTIVE and NOT_PUBLISHED
    const getTestData = await TestModel.findOne({
      _id: task_input.test_id,
      status: 'ACTIVE',
      published_status: 'NOT_PUBLISHED',
    });

    // *************** throwing error if test not found or already published
    if (!getTestData) {
      throw new ApolloError('Test not found');
    }

    // *************** checking if the responsible user exists and is ACTIVE
    const isUserExists = await UserModel.exists({
      _id: task_input.user_id,
      status: 'active',
    });

    // *************** throwing error if user not found or inactive
    if (!isUserExists) {
      throw new ApolloError('User not found');
    }

    // *************** update Test Data
    await TestModel.updateOne(
      { _id: task_input.test_id },
      {
        published_date: new Date(),
        published_status: 'PUBLISHED',
      }
    );

    // *************** creating ASSIGN_CORRECTOR task for the responsible user
    await TaskModel.create({
      test_id: task_input.test_id,
      user_id: task_input.user_id,
      type: 'ASSIGN_CORRECTOR',
      created_at: new Date(),
      created_by: defaultUser,
    });

    // *************** returning the test _id after publishing
    return getTestData._id;
  } catch (error) {
    // *************** throwing formatted Apollo error in case of exception
    throw new ApolloError(error.message);
  }
}

/**
 * Mutation resolver to assign a corrector for a test by updating the ASSIGN_CORRECTOR task
 * and creating a new ENTER_MARKS task for the assigned user.
 * Sends an email notification to the assigned corrector with relevant test and student info.
 *
 * @async
 * @function AssignCorrector
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the ASSIGN_CORRECTOR task to complete.
 * @param {Object} args.task_input - The input object containing the new corrector's user ID.
 * @param {string} args.task_input.user_id - The ID of the user to assign as the corrector.
 * @returns {Promise<string>} - A Promise that resolves to the newly created ENTER_MARKS task ID.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - The task ID or user ID is invalid.
 * - The ASSIGN_CORRECTOR task doesn't exist or isn't pending.
 * - The user doesn't exist or is not active.
 * - The test data is not found or already unpublished/deleted.
 */
async function AssignCorrector(_, { _id, task_input }) {
  // *************** validate id and task input user id
  ValidateIdMongoose(_id, '_id');
  ValidateIdMongoose(task_input.user_id, 'user_id');

  // *************** check if task exists
  const isTaskExists = await TaskModel.exists({
    _id: _id,
    type: 'ASSIGN_CORRECTOR',
    task_status: 'PENDING',
  });

  if (!isTaskExists) {
    throw new ApolloError('Task not found');
  }

  // *************** get user data in database
  const userData = await UserModel.findOne({
    _id: task_input.user_id,
    status: 'active',
  });

  if (!userData) {
    throw new ApolloError('User not found');
  }

  // *************** get task data
  const getTaskData = await TaskModel.findByIdAndUpdate(
    _id,
    {
      task_status: 'COMPLETED',
      $push: {
        updated_by: {
          user_id: defaultUser,
          updated_at: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!getTaskData) {
    throw new ApolloError('Task not found');
  }

  // *************** create enter marks task
  const createEnterMarksTask = await TaskModel.create({
    type: 'ENTER_MARKS',
    test_id: getTaskData.test_id,
    user_id: task_input.user_id,
    created_at: new Date(),
    created_by: defaultUser,
  });

  // *************** get test data
  const testData = await TestModel.findOne({
    _id: getTaskData.test_id,
    published_status: 'PUBLISHED',
    status: 'ACTIVE',
  }).populate('subject_id');

  if (!testData) {
    throw new ApolloError('Test not found');
  }

  // *************** get active student
  const students = await StudentModel.find({ status: 'active' });

  // *************** email that being send to corrector
  const emailSubject = 'You have been assigned as a Test Corrector!';
  const emailBody = `
  Hello ${userData.first_name} ${userData.last_name},

  You have been assigned to correct the test:
    - Test Name: ${testData.name}
    - Subject: ${testData.subject_id.name}
    - Description: ${testData.description}

    You will be correcting tests for the following students:
    ${students.map((s) => `- ${s.first_name} ${s.last_name}`).join('\n')}
      
    Thank you
    `;

  // *************** send to console
  console.log(`Subject: ${emailSubject}`);
  console.log(`Body:\n${emailBody}`);

  await SendEmail(userData.email, emailSubject, emailBody);

  // *************** return enter marks id
  return createEnterMarksTask._id;
}

// *************** LOADER ***************
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

/**
 * Initializes a new DataLoader instance for batching and caching student test result data fetches.
 * Uses the `StudentTestResultBatch` function to batch load student test results by their IDs.
 *
 * @function StudentTestResultBatchLoader
 * @returns {DataLoader<string, Object|null>} - A DataLoader instance for student test result data.
 */
async function studentTestResults(parent, _, ctx) {
  // *************** creating if to check if the test id empty
  if (!parent._id)
    // *************** returning value if test id is empty
    return [];

  // *************** returning the result to the caller using custom loader
  return await ctx.loaders.StudentTestResultLoader.load(parent._id);
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllTests,
    GetOneTest,
  },
  Mutation: {
    CreateTest,
    UpdateTest,
    DeleteTest,
    PublishTest,
    AssignCorrector,
  },
  Test: {
    subject: subject_id,
    studentTestResults: studentTestResults,
  },
};
