// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.models.js');

// *************** IMPORT VALIDATOR ***************

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

