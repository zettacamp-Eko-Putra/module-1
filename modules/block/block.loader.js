// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const KeyBy = require('lodash/keyBy');

// *************** IMPORT MODULE ***************
const BlockModel = require('./block.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require(`../../utilities/common-validator/mongo-validator.js`);

/**
 * Batch function to load block data based on a list of block IDs.
 *
 * @async
 * @function BlockBatch
 * @param {string[]} blockIds - Array of block IDs to fetch.
 * @returns {Promise<(Object|null)[]>} - A Promise that resolves to an array of block objects
 *   sorted by the order of input IDs. If a block ID is not found, `null` is returned in its place.
 *
 * @throws {ApolloError} - If blockIds are not valid MongoDB ObjectIds.
 */
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

/**
 * Creates a DataLoader instance for batching and caching block data fetches.
 *
 * @function BlockLoader
 * @returns {DataLoader<string, Object|null>} - A DataLoader instance that batches block ID queries.
 */
const BlockLoader = () => {
  // *************** creating dataloader using batch BlockBatch
  const loader = new DataLoader(BlockBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = BlockLoader;
