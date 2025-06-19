// *************** IMPORT LIBRARY ***************
const keyBy = require('lodash/keyBy');
const DataLoader = require('dataloader');
const { Types } = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.models.js');

/**
 * Batch function to load multiple schools by their IDs.
 * Validates that all provided IDs are valid MongoDB ObjectIds.
 * Only returns schools with status "active". If a school ID is invalid, not found, or inactive,
 * the corresponding result in the returned array will be `null`.
 *
 * @async
 * @function SchoolBatch
 * @param {Array<string|import('mongoose').Types.ObjectId>} schoolIds - An array of school IDs to fetch.
 * @throws {Error} Throws an error if any provided school ID is not a valid MongoDB ObjectId.
 * @returns {Promise<Array<Object|null>>} - A Promise that resolves to an array of school documents.
 * The order of the results matches the order of the input IDs.
 * If a school is not found or inactive, the corresponding entry will be `null`.
 */
async function SchoolBatch(schoolIds) {
  // *************** validate all schoolIDs
  const invalidSchoolId = schoolIds.filter(
    (ids) => !Types.ObjectId.isValid(ids)
  );
  if (invalidSchoolId.length) {
    throw new ApolloError(`Invalid school IDs: ${invalidSchoolId.join(', ')}`);
  }

  // *************** find school data based on id and status
  const schools = await SchoolModel.find({
    // *************** find active school by id
    _id: { $in: schoolIds },
    status: 'active',
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
 * @function CreateSchoolLoader
 * @returns {DataLoader<string|import('mongoose').Types.ObjectId, Object|null>} - A DataLoader instance for schools.
 */
function CreateSchoolLoader() {
  // *************** creating dataloader using batch SchoolBatch
  const loader = new DataLoader(SchoolBatch);

  // *************** return loader to the caller
  return loader;
}

// *************** EXPORT MODULE ***************
module.exports = CreateSchoolLoader;
