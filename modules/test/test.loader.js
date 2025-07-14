// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const KeyBy = require('lodash/keyBy');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require(`../../utilities/common-validator/mongo-validator.js`);

/**
 * Batch function to load test data based on a list of test IDs.
 *
 * @async
 * @function TestBatch
 * @param {string[]} testIds - Array of test IDs to fetch.
 * @returns {Promise<(Object|null)[]>} - A Promise that resolves to an array of test objects
 *   sorted according to the input order. If a test ID is not found, `null` is returned in its place.
 *
 * @throws {ApolloError} - Throws an ApolloError if any test ID is not a valid MongoDB ObjectId.
 */
async function TestBatch(testIds) {
  // *************** validate all testids
  ValidateArrayIdMongoose(testIds, 'Test Ids');

  // *************** find test data based on id
  const tests = await TestModel.find({
    _id: { $in: testIds },
  }).lean();

  // *************** create map from test id
  const testMap = KeyBy(tests, (test) => String(test._id));

  // *************** sort test data and giving null if the data is empty
  const result = testIds.map((id) => testMap[String(id)] || null);

  // *************** return the data to user
  return result;
}

/**
 * Creates a DataLoader instance for batching and caching test data fetches.
 *
 * @function TestLoader
 * @returns {DataLoader<string, Object|null>} - A DataLoader instance that batches test ID queries and returns corresponding test objects.
 */
const TestLoader = () => {
  // *************** creating dataloader using batch TestBatch
  const loader = new DataLoader(TestBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = TestLoader;
