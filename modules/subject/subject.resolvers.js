// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.models.js');
const BlockModel = require('../block/block.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

async function GetAllSubjects(_, args) {
  try {
    // *************** find subject data with status ACTIVE
    const activeSubjects = await SubjectModel.find({ status: 'ACTIVE' }).lean();

    // *************** returning subject data with status ACTIVE
    return activeSubjects;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

async function GetOneSubject(_, { _id }) {
  try {
    // *************** Validating Subject ID
    ValidateIdMongoose(_id, 'GetOneSubject');

    // *************** finding Subject based on id and status ACTIVE
    const subject = await SubjectModel.findOne({
      _id,
      status: 'ACTIVE',
    }).lean();

    // *************** showing message if the Subject cannot be found
    if (!subject) {
      throw new ApolloError('Subject Not Found');
    }

    // *************** returning subject data if Subject in database
    return subject;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

async function CreateSubject(_, { subject_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** validate subject_input
    // ValidateBlockInput(subject_input);

    // *************** check if block exists
    const isBlockExists = await BlockModel.exists({
      _id: subject_input.block_id,
      status: 'ACTIVE',
    });

    // *************** if block not exists throw ApolloError
    if (!isBlockExists) {
      throw new ApolloError('block not found');
    }

    // *************** Remove leading and trailing spaces from Subject name
    const inputName = subject_input.name.trim();

    // *************** find exists subject name in database
    const isSubjectNameAlreadyExists = await SubjectModel.exists({
      name: { $regex: `^${inputName}$`, $options: 'i' },
      status: 'ACTIVE',
    });

    // *************** Throwing error if there's exact name in database
    if (isSubjectNameAlreadyExists) {
      throw new ApolloError('Subject name already exists');
    }

    // *************** changing Subject input data and adding it to SubjectData
    const subjectData = {
      block_id: subject_input.block_id,
      name: inputName,
      description: subject_input.description,
      coefficient: subject_input.coefficient,
      created_by: user_id,
    };

    // *************** creating new subject based on the subjectData
    const createdSubject = await SubjectModel.create(subjectData);

    await BlockModel.updateOne(
      { _id: subject_input.block_id },
      { $push: { subject_ids: createdSubject._id } }
    );

    // *************** returning new subject data
    return createdSubject;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

module.exports = {
  Query: {
    GetAllSubjects,
    GetOneSubject,
  },
  Mutation: {
    CreateSubject,
  },
};
