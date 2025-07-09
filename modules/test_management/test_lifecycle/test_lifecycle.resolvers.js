const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TaskModel = require('../task/task.models.js');
const TestModel = require('../../test/test.models.js');
const UserModel = require('../../user/user.models.js');
const StudentModel = require('../../student/student.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../../utilities/common-validator/mongo-validator.js');

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
      status: 'ACTIVE',
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

  ValidateIdMongoose(_id);
  ValidateIdMongoose(task_input.user_id);

  const isUserExists = await UserModel.exists({
    _id: task_input.user_id,
    status: 'ACTIVE',
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
  }).populate('subject');

  const students = await StudentModel.find({ status: 'ACTIVE' });

  const emailSubject = 'You have been assigned as a Test Corrector!';
  const emailBody = `
    You have been assigned to correct the test:
      - Test Name: ${testData.name}
      - Subject: ${testData.subject.name}
      - Description: ${testData.description}

       You will be correcting tests for the following students:
      ${students.map((s) => `- ${s.name}`).join('\n')}
      `;

  console.log(`Subject: ${emailSubject}`);
  console.log(`Body:\n${emailBody}`);

  return createEnterMarksTask._id;
}

module.exports = {
  Mutation: {
    PublishTest,
    AssignCorrector,
  },
};
