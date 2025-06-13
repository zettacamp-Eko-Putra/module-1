// *************** IMPORT LIBRARY ***************
const keyBy = require("lodash/keyBy");
const DataLoader = require("dataloader");

// *************** IMPORT MODULE ***************
const School = require("./school.models.js");

/**
 * Batch function to load multiple schools by their IDs.
 * Only returns schools with status "active". If a school ID is not found or inactive,
 * the corresponding result will be `null`.
 *
 * @async
 * @function SchoolBatch
 * @param {Array<string|import('mongoose').Types.ObjectId>} schoolId - An array of school IDs to fetch.
 * @returns {Promise<Array<Object|null>>} - An array of school documents in the same order as the input IDs, or `null` for IDs not found.
 */
async function SchoolBatch(schoolIds) {
  // *************** find school data
  const schools = await School.find({
    // *************** find active school by id
    _id: { $in: schoolIds },
    status: "active",
  }).lean();

  // *************** change array to object key base on school id
  const schoolMap = keyBy(schools, (school) => school._id.toString());

  // *************** sort school data and giving null if the data is empty
  const result = schoolIds.map((id) => schoolMap[id.toString()] || null);

  // *************** return data to user
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
