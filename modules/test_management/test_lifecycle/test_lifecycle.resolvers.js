const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const TaskModel = require('../task/task.models.js');
const TestModel = require('../../test/test.models.js');
const UserModel = require('../../user/user.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../../utilities/common-validator/mongo-validator.js');

async function PublishTest(_, { task_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    ValidateIdMongoose(task_input.test_id);
    ValidateIdMongoose(task_input.user_id);

    const getTestData = await TestModel.findOne({
      _id: task_input.test_id,
      status: 'ACTIVE',
      published_status: 'NOT_PUBLISHED',
    });

    if (!getTestData) {
      throw new ApolloError('Test not found');
    }

    const isUserExists = await UserModel.exists({
      _id: task_input.user_id,
      status: 'ACTIVE',
    });

    if (!isUserExists) {
      throw new ApolloError('User not found');
    }

    getTestData.published_date = new Date();
    getTestData.published_status = 'PUBLISHED';
    await getTestData.save();

    const createAssignCorrectorTask = new TaskModel({
      test_id: task_input.test_id,
      user_id: task_input.user_id,
      type: 'ASSIGN_CORRECTOR',
      created_at: new Date(),
      created_by: user_id,
    });

    await createAssignCorrectorTask.save();

    return getTestData._id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

module.exports = {
  Mutation: {
    PublishTest,
  },
};
