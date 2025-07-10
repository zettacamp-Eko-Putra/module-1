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

async function AssignCorrector(_, { _id, task_input }) {
  // *************** get one user id
  const user_id = '686b93d2cb55171e10da8c00';

  // *************** validate id and task input user id
  ValidateIdMongoose(_id);
  ValidateIdMongoose(task_input.user_id);

  const isUserExists = await UserModel.exists({
    _id: task_input.user_id,
    status: 'active',
  });

  if (!isUserExists) {
    throw new ApolloError('User not found');
  }

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

  const createEnterMarksTask = new TaskModel({
    type: 'ENTER_MARKS',
    test_id: getTaskData.test_id,
    user_id: task_input.user_id,
    created_at: new Date(),
    created_by: user_id,
  });
  // *************** saving the new ENTER_MARKS task
  await createEnterMarksTask.save();

  const testData = await TestModel.findOne({
    _id: getTaskData.test_id,
    published_status: 'PUBLISHED',
    status: 'ACTIVE',
  }).populate('subject_id');

  const students = await StudentModel.find({ status: 'active' });

  const emailSubject = 'You have been assigned as a Test Corrector!';
  const emailBody = `
    You have been assigned to correct the test:
      - Test Name: ${testData.name}
      - Subject: ${testData.subject_id.name}
      - Description: ${testData.description}

       You will be correcting tests for the following students:
      ${students.map((s) => `- ${s.first_name} ${s.last_name}`).join('\n')}
      `;

  console.log(`Subject: ${emailSubject}`);
  console.log(`Body:\n${emailBody}`);

  return createEnterMarksTask._id;
}

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

async function ValidateMarks(_, { _id, task_input }) {
  ValidateIdMongoose(_id);
  ValidateIdMongoose(task_input.studentTestResult_id);

  const getStudentTestResultData =
    await StudentTestResultModel.findOneAndUpdate(
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

  const getTaskData = await TaskModel.findOneAndUpdate(
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
