// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const BlockModel = require('../block/block.models.js');
const SubjectModel = require('../subject/subject.models.js');
const TestModel = require('../test/test.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateBlockInput } = require('./block.validator.js');
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

/**
 * Query resolver to retrieve all blocks with status "ACTIVE".
 *
 * @async
 * @function GetAllBlocks
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments (not used in this function).
 * @returns {Promise<Object[]>} - A Promise that resolves to an array of block objects with status "ACTIVE".
 *
 * @throws {ApolloError} - Throws an ApolloError if fetching blocks fails.
 */
async function GetAllBlocks(_, args) {
  try {
    // *************** find block data with status ACTIVE
    const activeBlocks = await BlockModel.find({ status: 'ACTIVE' }).lean();

    // *************** returning block data that has status "ACTIVE"
    return activeBlocks;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Query resolver to retrieve a single block by its ID with status "ACTIVE".
 *
 * @async
 * @function GetOneBlock
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL query arguments.
 * @param {string} args._id - The ID of the block to retrieve.
 * @returns {Promise<Object>} - A Promise that resolves to the block object if found.
 *
 * @throws {ApolloError} - Throws an ApolloError if the ID is invalid, the block is not found,
 *   or if any other error occurs during the process.
 */
async function GetOneBlock(_, { _id }) {
  try {
    // *************** Validating block ID
    ValidateIdMongoose(_id, 'GetOneBlock');

    // *************** finding block based on id and status ACTIVE
    const block = await BlockModel.findOne({
      _id,
      status: 'ACTIVE',
    }).lean();

    // *************** showing message if the block cannot be found
    if (!block) {
      throw new ApolloError('Block Not Found');
    }

    // *************** returning block data if block in database
    return block;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Mutation resolver to create a new block if the name does not already exist.
 *
 * @async
 * @function CreateBlock
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {Object} args.block_input - Input object containing block details.
 * @param {string} args.block_input.name - Name of the block.
 * @param {string} args.block_input.description - Description of the block.
 * @returns {Promise<Object>} - A Promise that resolves to the newly created block object.
 *
 * @throws {ApolloError} - Throws an ApolloError if validation fails, the block name already exists,
 *   or if an error occurs during creation.
 */
async function CreateBlock(_, { block_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** validate block_input
    ValidateBlockInput(block_input);

    // *************** Remove leading and trailing spaces from block name
    const inputName = block_input.name.trim();

    // *************** find block name in database
    const isBlockNameAlreadyExists = await BlockModel.exists({
      name: { $regex: `^${inputName}$`, $options: 'i' },
      status: 'ACTIVE',
    });

    // *************** Throwing error if there's exact name in database
    if (isBlockNameAlreadyExists) {
      throw new ApolloError('Block name already exists');
    }

    // *************** changing block input data and adding it to blockData
    const blockData = {
      name: inputName,
      description: block_input.description,
      created_by: user_id,
    };

    // *************** creating new block based on the blockData
    const createdBlock = await BlockModel.create(blockData);

    // *************** returning new block data
    return createdBlock;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Mutation resolver to update a block by its ID with new data.
 *
 * @async
 * @function UpdateBlock
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the block to update.
 * @param {Object} args.block_input - Input object containing the updated block details.
 * @param {string} args.block_input.name - Updated name of the block.
 * @param {string} args.block_input.description - Updated description of the block.
 * @returns {Promise<Object>} - A Promise that resolves to the updated block object.
 *
 * @throws {ApolloError} - Throws an ApolloError if the ID is invalid, validation fails,
 *   the block is not found, or the name already exists.
 */
async function UpdateBlock(_, { _id, block_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** Validating block id and block input
    ValidateIdMongoose(_id, 'UpdateBlock');
    ValidateBlockInput(block_input);

    // *************** find block data
    const currentBlock = await BlockModel.findOne({
      _id: _id,
      status: 'ACTIVE',
    });

    if (!currentBlock) {
      throw new ApolloError('block not found');
    }

    // *************** Remove leading and trailing spaces from block legal name
    const inputName = block_input.name.trim();

    // *************** Take current block legal name
    const currentBlockName = currentBlock.name.trim();

    // *************** Only check duplication if legal name changed
    if (inputName !== currentBlockName) {
      const isBlockNameAlreadyExists = await BlockModel.exists({
        name: { $regex: `^${inputName}$`, $options: 'i' },
        status: 'ACTIVE',
        _id: { $ne: _id },
      });

      if (isBlockNameAlreadyExists) {
        throw new ApolloError('block name already exists');
      }
    }

    // *************** breakdown block input
    const blockData = {
      name: inputName,
      description: block_input.description,
    };

    // *************** finding block based on id and overwrite it with new data and saving it to database
    const updatedBlock = await BlockModel.findOneAndUpdate(
      { _id, status: 'ACTIVE' },
      {
        $set: blockData,
        $push: {
          updated_by: {
            user_id: user_id,
            updated_at: new Date(),
          },
        },
      },
      { new: true }
    ).lean();

    // ***************  showing error message if the block id cannot be found in database
    if (!updatedBlock) {
      throw new ApolloError('block not Found');
    }

    // *************** returning block updated data to user
    return updatedBlock;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Mutation resolver to soft delete a block by setting its status to "DELETED".
 *
 * @async
 * @function DeleteBlock
 * @param {any} _ - Unused parent resolver argument.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {string} args._id - The ID of the block to delete.
 * @returns {Promise<string>} - A Promise that resolves to the deleted block's ID.
 *
 * @throws {ApolloError} - Throws an ApolloError if the block ID is invalid,
 *   a published test exists under the block, the block is not found,
 *   or any other error occurs during deletion.
 */
async function DeleteBlock(_, { _id }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** checking if the block id is valid
    ValidateIdMongoose(_id, 'DeleteBlock');

    // *************** finding Subject
    const subjectIdList = await SubjectModel.distinct('_id', {
      block_id: _id,
      status: 'ACTIVE',
    });

    // *************** check if there test already published
    const hasPublishedTest = await TestModel.exists({
      subject_id: { $in: subjectIdList },
      status: 'ACTIVE',
      published_status: 'PUBLISHED',
    });

    if (hasPublishedTest) {
      throw new ApolloError('cannot delete, there test already published');
    }

    // *************** finding block and update the data
    const deleteBlock = await BlockModel.findOneAndUpdate(
      { _id, status: { $in: 'ACTIVE' } },
      {
        // *************** changing status field to DELETED and adding timestamp
        status: 'DELETED',
        deleted_by: user_id,
        deleted_at: new Date(),
      }
    )
      .select('_id')
      .lean();

    // *************** Delete all subjects under this block
    const deletedSubjects = await SubjectModel.updateMany(
      { block_id: _id, status: 'ACTIVE' },
      {
        status: 'DELETED',
        deleted_at: new Date(),
        deleted_by: user_id,
      }
    );

    // *************** Delete all tests that belong to those subjects
    await TestModel.updateMany(
      { subject_id: { $in: subjectIdList }, status: 'ACTIVE' },
      {
        status: 'DELETED',
        deleted_at: new Date(),
        deleted_by: user_id,
      }
    );

    // *************** showing error message if block already deleted
    if (!deleteBlock) {
      throw new ApolloError('block not found');
    }

    // *************** returning block deleted id to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Field resolver to retrieve subject data for a block based on subject_ids array.
 *
 * @async
 * @function subject_ids
 * @param {Object} parent - Parent object containing subject_ids field.
 * @param {any} _ - Unused GraphQL argument.
 * @param {Object} ctx - GraphQL context containing DataLoader instances.
 * @param {DataLoader<string, Object|null>} ctx.loaders.SubjectLoader - DataLoader for loading subjects by ID.
 * @returns {Promise<Object[]>} - A Promise that resolves to an array of subject objects. Returns an empty array if no subject_ids are present.
 */
async function subject_ids(parent, _, ctx) {
  // *************** creating if to check if the block subject array empty
  if (!parent.subject_ids || !parent.subject_ids.length) {
    // *************** retuning value if subject array empty
    return [];
  }

  // *************** retuning the result to the caller
  return await ctx.loaders.SubjectLoader.loadMany(parent.subject_ids);
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllBlocks,
    GetOneBlock,
  },
  Mutation: {
    CreateBlock,
    UpdateBlock,
    DeleteBlock,
  },
  Block: {
    subject_ids,
  },
};
