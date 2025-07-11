// *************** IMPORT LIBRARY ***************
const keyBy = require('lodash/keyBy');
const DataLoader = require('dataloader');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

/**
 * Batch function to load multiple active schools by their IDs using DataLoader.
 * - Validates each ID to ensure it is a valid MongoDB ObjectId.
 * - Fetches schools with matching IDs and status 'active'.
 * - Returns the results in the same order as the input IDs.
 * - If a school is not found or inactive, `null` is returned in its place.
 *
 * @async
 * @function SchoolBatch
 * @param {Array<string|import('mongoose').Types.ObjectId>} schoolIds - An array of school IDs to load.
 * @returns {Promise<Array<Object|null>>} - An array of school documents or `null` for not found/inactive entries, maintaining input order.
 * @throws {ApolloError} - Throws if an invalid ID is encountered or if the query fails.
 */
async function SchoolBatch(schoolIds) {
  // *************** validate all schoolIDs
  ValidateArrayIdMongoose(schoolIds, 'School Id');

  // *************** find school based on id
  const schools = await SchoolModel.find({
    _id: { $in: schoolIds },
  }).lean();

  // *************** change array to object key base on school id
  const schoolMap = keyBy(schools, (school) => String(school._id));

  // *************** sort school data and giving null if the data is empty
  const result = schoolIds.map((id) => schoolMap[String(id)] || null);

  // *************** return data to caller
  return result;
}

/**
 * Creates a DataLoader instance for batching and caching school data retrieval.
 *
 * @function SchoolLoader
 * @returns {DataLoader<string|import('mongoose').Types.ObjectId, Object|null>} - A DataLoader instance for schools.
 */
function SchoolLoader() {
  // *************** creating dataloader using batch SchoolBatch
  const loader = new DataLoader(SchoolBatch);

  // *************** return loader to the caller
  return loader;
}

// *************** EXPORT MODULE ***************
module.exports = SchoolLoader;
