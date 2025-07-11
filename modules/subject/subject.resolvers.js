// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');
require('dotenv').config();

// *************** IMPORT MODULE ***************
const SubjectModel = require('../subject/subject.models.js');
const BlockModel = require('../block/block.models.js');
const TestModel = require('../test/test.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateSubjectInput } = require('./subject.validator.js');
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

/**
 * Query resolver to retrieve all subjects with status "ACTIVE".
 *
 * @async
 * @function GetAllSubjects
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments (not used in this function).
 * @returns {Promise<Object[]>} - A Promise that resolves to an array of subject objects with status "ACTIVE".
 *
 * @throws {ApolloError} - Throws an ApolloError if fetching subjects fails.
 */
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

/**
 * Query resolver to retrieve a single subject by its ID with status "ACTIVE".
 *
 * @async
 * @function GetOneSubject
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments.
 * @param {string} args._id - The ID of the subject to retrieve.
 * @returns {Promise<Object>} - A Promise that resolves to the subject object if found.
 *
 * @throws {ApolloError} - Throws an ApolloError if the ID is invalid,
 *   the subject is not found, or an error occurs during retrieval.
 */
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

/**
 * Mutation resolver to create a new subject under a specified block.
 *
 * @async
 * @function CreateSubject
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {Object} args.subject_input - Input object containing subject details.
 * @param {string} args.subject_input.block_id - ID of the block the subject belongs to.
 * @param {string} args.subject_input.name - Name of the subject.
 * @param {string} args.subject_input.description - Description of the subject.
 * @param {number} args.subject_input.coefficient - Coefficient value of the subject.
 * @returns {Promise<Object>} - A Promise that resolves to the newly created subject object.
 *
 * @throws {ApolloError} - Throws an ApolloError if validation fails, block is not found,
 *   subject name already exists in the same block, or an error occurs during creation.
 */
async function CreateSubject(_, { subject_input }) {
  try {
    // *************** get one user id
    const createUserId = process.env.DEFAULT_USER_ID;

    // *************** validate subject_input
    ValidateSubjectInput(subject_input);

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

    // *************** find exists subject name in same block
    const isSubjectNameAlreadyExists = await SubjectModel.exists({
      block_id: subject_input.block_id,
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
      created_by: createUserId,
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

/**
 * Mutation resolver to update a subject by its ID with new data.
 *
 * @async
 * @function UpdateSubject
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the subject to update.
 * @param {Object} args.subject_input - Input object containing the updated subject details.
 * @param {string} args.subject_input.name - Updated name of the subject.
 * @param {string} args.subject_input.description - Updated description of the subject.
 * @param {number} args.subject_input.coefficient - Updated coefficient value of the subject.
 * @returns {Promise<Object>} - A Promise that resolves to the updated subject object.
 *
 * @throws {ApolloError} - Throws an ApolloError if validation fails,
 *   the subject is not found, the name already exists in the same block,
 *   or if the coefficient is modified while a published test exists.
 */
async function UpdateSubject(_, { _id, subject_input }) {
  try {
    // *************** get one user id
    const updateUserId = process.env.DEFAULT_USER_ID;

    // *************** Validating subject id and subject input
    ValidateIdMongoose(_id, 'UpdateSubject');
    ValidateSubjectInput(subject_input);

    // *************** Remove leading and trailing spaces from subject legal name
    const inputName = subject_input.name.trim();

    // *************** Find current subject by id
    const currentSubject = await SubjectModel.findById(_id).lean();

    if (subject_input.coefficient !== currentSubject.coefficient) {
      // *************** checking if the Subject has published test
      const hasPublishedTest = await TestModel.exists({
        subject_id: _id,
        status: 'ACTIVE',
        published_status: 'PUBLISHED',
      });
      if (hasPublishedTest) {
        throw new ApolloError(
          'cannot update coefficient, there test already published'
        );
      }
    }

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
            user_id: updateUserId,
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

/**
 * Mutation resolver to soft delete a subject by setting its status to "DELETED".
 *
 * @async
 * @function DeleteSubject
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the subject to delete.
 * @returns {Promise<string>} - A Promise that resolves to the deleted subject's ID.
 *
 * @throws {ApolloError} - Throws an ApolloError if the subject ID is invalid,
 *   a published test exists for the subject, the subject is not found,
 *   or any error occurs during the deletion process.
 */
async function DeleteSubject(_, { _id }) {
  try {
    // *************** get one user id
    const deleteUserId = process.env.DEFAULT_USER_ID;

    // *************** checking if the Subject id is valid
    ValidateIdMongoose(_id, 'DeleteSubject');

    // *************** checking if the Subject has published test
    const hasPublishedTest = await TestModel.exists({
      subject_id: _id,
      status: 'ACTIVE',
      published_status: 'PUBLISHED',
    });

    if (hasPublishedTest) {
      throw new ApolloError('cannot delete, there test already published');
    }

    // *************** finding Subject and update the data
    const deleteSubject = await SubjectModel.findOneAndUpdate(
      { _id, status: 'ACTIVE' },
      {
        // *************** changing status field to DELETED and adding timestamp
        status: 'DELETED',
        deleted_by: deleteUserId,
        deleted_at: new Date(),
      }
    ).lean();

    // *************** showing error message if subject already deleted
    if (!deleteSubject) {
      throw new ApolloError('Subject not found');
    }

    await BlockModel.updateOne(
      { _id: deleteSubject.block_id },
      { $pull: { subject_ids: deleteSubject._id } }
    );

    // *************** Delete all tests that belong to those subjects
    await TestModel.updateMany(
      { subject_id: _id, status: 'ACTIVE' },
      {
        status: 'DELETED',
        deleted_at: new Date(),
        deleted_by: deleteUserId,
      }
    );

    // *************** returning subject deleted id to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Field resolver to retrieve block data for a subject based on its block_id.
 *
 * @async
 * @function block_id
 * @param {Object} parent - Parent object containing block_id field.
 * @param {any} _ - Unused GraphQL argument.
 * @param {Object} ctx - GraphQL context containing DataLoader instances.
 * @param {DataLoader<string, Object|null>} ctx.loaders.BlockLoader - DataLoader for loading blocks by ID.
 * @returns {Promise<Object|null>} - A Promise that resolves to the block object, or null if block_id is not present.
 */
async function block_id(parent, _, ctx) {
  // *************** creating if to check if the block block array empty
  if (!parent.block_id)
    // *************** retuning value if block array empty
    return null;

  // *************** retuning the result to the caller
  return await ctx.loaders.BlockLoader.load(parent.block_id);
}

/**
 * Field resolver to retrieve test data for a subject based on test_ids array.
 *
 * @async
 * @function test_ids
 * @param {Object} parent - Parent object containing test_ids field.
 * @param {any} _ - Unused GraphQL argument.
 * @param {Object} ctx - GraphQL context containing DataLoader instances.
 * @param {DataLoader<string, Object|null>} ctx.loaders.TestLoader - DataLoader for loading tests by ID.
 * @returns {Promise<Object[]>} - A Promise that resolves to an array of test objects. Returns an empty array if no test_ids are present.
 */
async function test_ids(parent, _, ctx) {
  // *************** creating if to check if the testids block array empty
  if (!parent.test_ids || !parent.test_ids.length) {
    // *************** retuning value if test array empty
    return [];
  }

  // *************** retuning the result to the caller
  return await ctx.loaders.TestLoader.loadMany(parent.test_ids);
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
    test_ids,
  },
};
