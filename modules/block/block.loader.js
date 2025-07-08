// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const KeyBy = require('lodash/keyBy');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require(`../../utilities/common-validator/mongo-validator.js`);

async function BlockBatch(blockIds) {
  // *************** validate all blockId
  ValidateArrayIdMongoose(blockIds, 'blockIds');

  // *************** find block data based on id
  const blocks = await BlockModel.find({
    _id: { $in: blockIds },
  }).lean();

  // *************** create map from block id
  const blockMap = KeyBy(blocks, (block) => String(block._id));

  // *************** sort block data and giving null if the data is empty
  const result = blockIds.map((id) => blockMap[String(id)] || null);

  // *************** return the data to user
  return result;
}

const BlockLoader = () => {
  // *************** creating dataloader using batch BlockBatch
  const loader = new DataLoader(BlockBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = BlockLoader;
