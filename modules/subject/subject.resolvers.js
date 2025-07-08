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

async function UpdateSubject(_, { _id, subject_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** Validating subject id and subject input
    ValidateIdMongoose(_id, 'UpdateBlock');
    ValidateSubjectInput(subject_input);

    // *************** Remove leading and trailing spaces from subject legal name
    const inputName = subject_input.name.trim();

    // *************** Find current subject by id
    const currentSubject = await SubjectModel.findById(_id).lean();

    // *************** Take current subject legal name
    const currentSubjectName = currentSubject.name.trim().toLowerCase();

    // *************** Only check duplication if name changed
    if (inputName !== currentSubjectName) {
      const isSubjectNameAlreadyExists = await SubjectModel.exists({
        name: { $regex: `^${inputName}$`, $options: 'i' },
        status: 'ACTIVE',
        block_id: currentSubject.block_id,
        _id: { $ne: _id },
      });

      if (isSubjectNameAlreadyExists) {
        throw new ApolloError('subject name already exists');
      }
    }

    // *************** breakdown subject input
    const subjectData = {
      name: inputName,
      description: subject_input.description,
      coefficient: subject_input.coefficient,
    };

    // *************** finding subject based on id and overwrite it with new data and saving it to database
    const updatedSubject = await SubjectModel.findOneAndUpdate(
      { _id, status: 'ACTIVE' },
      {
        $set: subjectData,
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
    if (!updatedSubject) {
      throw new ApolloError('subject not Found');
    }

    // *************** returning subject updated data to user
    return updatedSubject;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

async function DeleteSubject(_, { _id }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** checking if the Subject id is valid
    ValidateIdMongoose(_id, 'DeleteSubject');

    // *************** finding Subject and update the data
    const deleteSubject = await SubjectModel.findOneAndUpdate(
      { _id, status: 'ACTIVE' },
      {
        // *************** changing status field to DELETED and adding timestamp
        status: 'DELETED',
        deleted_by: user_id,
        deleted_at: new Date(),
      },
      { new: true }
    ).lean();

    // *************** showing error message if subject already deleted
    if (!deleteSubject) {
      throw new ApolloError('Subject not found');
    }

    await BlockModel.updateOne(
      { _id: deleteSubject.block_id },
      { $pull: { subject_ids: deleteSubject._id } }
    );

    // *************** returning subject deleted id to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

async function block_id(parent, _, ctx) {
  // *************** creating if to check if the block block array empty
  if (!parent.block)
    // *************** retuning value if block array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.BlockLoader.loadOne(parent.block);
}

async function test_ids(parent, _, ctx) {
  // *************** creating if to check if the test block array empty
  if (!parent.test || !parent.test.length) {
    // *************** retuning value if test array empty
    return [];
  }

  // *************** retuning the result to the caller
  return await ctx.loaders.TestLoader.loadMany(parent.test);
}

module.exports = {
  Query: {
    GetAllSubjects,
    GetOneSubject,
  },
  Mutation: {
    CreateSubject,
    UpdateSubject,
    DeleteSubject,
  },
  Subject: {
    block: block_id,
    test: test_ids,
  },
};
