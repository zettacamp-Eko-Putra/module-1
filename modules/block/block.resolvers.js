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
