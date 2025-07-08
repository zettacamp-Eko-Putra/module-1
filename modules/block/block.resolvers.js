// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateBlockInput } = require('./block.validator.js');
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

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

async function CreateBlock(_, { block_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** validate block_input
    ValidateBlockInput(block_input);

    // *************** Remove leading and trailing spaces from block name
    const inputName = block_input.name.trim();

    // *************** find exists school legal name in database
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

async function UpdateBlock(_, { _id, block_input }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** Validating block id and block input
    ValidateIdMongoose(_id, 'UpdateBlock');
    ValidateBlockInput(block_input);

    // *************** Remove leading and trailing spaces from block legal name
    const inputName = block_input.name.trim();

    // *************** Find current block by id
    const currentBlock = await BlockModel.findById(_id).lean();

    // *************** Take current block legal name
    const currentBlockName = currentBlock.name.trim().toLowerCase();

    // *************** Only check duplication if legal name changed
    if (inputName !== currentBlockName) {
      const isBlockNameAlreadyExists = await BlockModel.exists({
        name: { $regex: `^${inputName}$`, $options: 'i' },
        status: 'ACTIVE',
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

async function DeleteBlock(_, { _id }) {
  try {
    // *************** get one user id
    const user_id = '686b93d2cb55171e10da8c00';

    // *************** checking if the block id is valid
    ValidateIdMongoose(_id, 'DeleteBlock');

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

async function subject_ids(parent, _, ctx) {
  // *************** creating if to check if the block subject array empty
  if (!parent.subject || !parent.subject.length) {
    // *************** retuning value if student array empty
    return [];
  }

  // *************** retuning the result to the caller
  return await ctx.loaders.SubjectLoader.loadMany(parent.subject);
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
  block: {
    subjects: subject_ids,
  },
};
