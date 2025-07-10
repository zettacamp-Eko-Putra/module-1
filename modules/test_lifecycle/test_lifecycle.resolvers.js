const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TaskModel = require('../task/task.models.js');
const TestModel = require('../test/test.models.js');
const UserModel = require('../user/user.models.js');
const StudentModel = require('../student/student.models.js');
const StudentTestResultModel = require('../student_test_result/student_test_result.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

/**
 * Mutation resolver to publish a test and create an ASSIGN_CORRECTOR task.
 * Publishes a test if it's active and not yet published,
 * and assigns a user to the next step in the workflow.
 *
 * @async
 * @function PublishTest
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {Object} args.task_input - Input containing test and user information.
 * @param {string} args.task_input.test_id - The ID of the test to publish.
 * @param {string} args.task_input.user_id - The ID of the user to assign as corrector.
 * @returns {Promise<string>} - A Promise that resolves to the published test's ID.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - test_id or user_id is invalid.
 * - The test is not found, already published, or not active.
 * - The user is not found or not active.
 * - Any error occurs during update or task creation.
 */
async function PublishTest(_, { task_input }) {
  try {
    // *************** get one user
    const userIdCreate = '686b93d2cb55171e10da8c00';

    // *************** validating test_id and user_id
    ValidateIdMongoose(task_input.test_id);
    ValidateIdMongoose(task_input.user_id);

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

    // *************** preparing test update data with publish info
    const updateTestData = {
      published_date: new Date(),
      published_status: 'PUBLISHED',
    };

    // *************** applying the update to the test document
    getTestData.set(updateTestData);
    await getTestData.save();

    // *************** creating ASSIGN_CORRECTOR task for the responsible user
    const createAssignCorrectorTask = new TaskModel({
      test_id: task_input.test_id,
      user_id: task_input.user_id,
      type: 'ASSIGN_CORRECTOR',
      created_at: new Date(),
      created_by: userIdCreate,
    });

    // *************** saving the task to the database
    await createAssignCorrectorTask.save();

    // *************** returning the test _id after publishing
    return getTestData._id;
  } catch (error) {
    // *************** throwing formatted Apollo error in case of exception
    throw new ApolloError(error.message);
  }
}

/**
 * Mutation resolver to assign a corrector for a test by completing the ASSIGN_CORRECTOR task
 * and creating a new ENTER_MARKS task for the assigned user.
 * Also logs a simulated email notification to the console.
 *
 * @async
 * @function AssignCorrector
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the task (ASSIGN_CORRECTOR) to complete.
 * @param {Object} args.task_input - Input object containing user_id to assign as corrector.
 * @param {string} args.task_input.user_id - The ID of the user who will enter marks.
 * @returns {Promise<string>} - A Promise that resolves to the ID of the newly created ENTER_MARKS task.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - The task ID or user ID is invalid.
 * - The user does not exist or is not active.
 * - The task is not found or not in PENDING status.
 * - The test is not found or not published and active.
 */
async function AssignCorrector(_, { _id, task_input }) {
  // *************** get one user id
  const user_id = '686b93d2cb55171e10da8c00';

  // *************** validate id and task input user id
  ValidateIdMongoose(_id);
  ValidateIdMongoose(task_input.user_id);

  // *************** check user exists in database
  const isUserExists = await UserModel.exists({
    _id: task_input.user_id,
    status: 'active',
  });

  if (!isUserExists) {
    throw new ApolloError('User not found');
  }

  // *************** get task data
  const getTaskData = await TaskModel.findOneAndUpdate(
    {
      _id: _id,
      type: 'ASSIGN_CORRECTOR',
      task_status: 'PENDING',
    },
    {
      task_status: 'COMPLETED',
      $push: {
        updated_by: {
          user_id: user_id,
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
  const createEnterMarksTask = new TaskModel({
    type: 'ENTER_MARKS',
    test_id: getTaskData.test_id,
    user_id: task_input.user_id,
    created_at: new Date(),
    created_by: user_id,
  });
  // *************** saving the new ENTER_MARKS task
  await createEnterMarksTask.save();

  // *************** get test data
  const testData = await TestModel.findOne({
    _id: getTaskData.test_id,
    published_status: 'PUBLISHED',
    status: 'ACTIVE',
  }).populate('subject_id');

  // *************** get active student
  const students = await StudentModel.find({ status: 'active' });

  // *************** email that being send to corrector
  const emailSubject = 'You have been assigned as a Test Corrector!';
  const emailBody = `
    You have been assigned to correct the test:
      - Test Name: ${testData.name}
      - Subject: ${testData.subject_id.name}
      - Description: ${testData.description}

       You will be correcting tests for the following students:
      ${students.map((s) => `- ${s.first_name} ${s.last_name}`).join('\n')}
      `;

  // *************** send to console
  console.log(`Subject: ${emailSubject}`);
  console.log(`Body:\n${emailBody}`);

  // *************** return enter marks id
  return createEnterMarksTask._id;
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
  const average = (total / task_input.marks.length, toFixed(2));

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
 * Mutation resolver to validate the marks of a student's test result.
 * Marks the student test result as VALIDATED and completes the corresponding VALIDATE_MARKS task.
 *
 * @async
 * @function ValidateMarks
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the VALIDATE_MARKS task to complete.
 * @param {Object} args.task_input - Input object containing student test result ID.
 * @param {string} args.task_input.studentTestResult_id - The ID of the student test result to validate.
 * @returns {Promise<string>} - A Promise that resolves to the completed task ID.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - Any ID is invalid.
 * - Student test result is not found or already validated.
 * - Task is not found, not active, or not in PENDING status.
 */
async function ValidateMarks(_, { _id, task_input }) {
  // *************** validate id and input id
  ValidateIdMongoose(_id);
  ValidateIdMongoose(task_input.studentTestResult_id);

  // *************** student test result data
  const getStudentTestResultData = await StudentTestResultModel.findOne(
    {
      _id: task_input.studentTestResult_id,
      status: 'ACTIVE',
      validation_status: 'NOT_VALIDATED',
    },
    {
      validation_status: 'VALIDATED',
    }
  );

  if (!getStudentTestResultData) {
    throw new ApolloError('Student test result not found');
  }

  // *************** get task data
  const getTaskData = await TaskModel.findOne(
    {
      _id: _id,
      type: 'VALIDATE_MARKS',
      status: 'ACTIVE',
      task_status: 'PENDING',
    },
    {
      task_status: 'COMPLETED',
    }
  );
  if (!getTaskData) {
    throw new ApolloError('Task not found');
  }

  await StudentTestResultModel.updateOne(
    { _id: task_input.studentTestResult_id },
    { validation_status: 'VALIDATED' }
  );

  await TaskModel.updateOne({ _id }, { task_status: 'COMPLETED' });

  return _id;
}
module.exports = {
  Mutation: {
    PublishTest,
    AssignCorrector,
    EnterMarksForStudentTestResult,
    ValidateMarks,
  },
};
