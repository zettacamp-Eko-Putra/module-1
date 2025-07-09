// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const KeyBy = require('lodash/keyBy');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require(`../../utilities/common-validator/mongo-validator.js`);

/**
 * Batch function to load subject data based on a list of subject IDs.
 *
 * @async
 * @function SubjectBatch
 * @param {string[]} subjectIds - Array of subject IDs to fetch.
 * @returns {Promise<(Object|null)[]>} - A Promise that resolves to an array of subject objects
 *   sorted by the order of input IDs. If a subject ID is not found, `null` is returned in its place.
 *
 * @throws {ApolloError} - If subjectIds are not valid MongoDB ObjectIds.
 */
async function SubjectBatch(subjectIds) {
  // *************** validate all subjectIds
  ValidateArrayIdMongoose(subjectIds, 'subjectIds');

  // *************** find subject data based on id
  const subjects = await SubjectModel.find({
    _id: { $in: subjectIds },
  }).lean();

  // *************** create map from subject id
  const subjectMap = KeyBy(subjects, (subject) => String(subject._id));

  // *************** sort subject data and giving null if the data is empty
  const result = subjectIds.map((id) => subjectMap[String(id)] || null);

  // *************** return the data to user
  return result;
}

/**
 * Creates a DataLoader instance for batching and caching subject data fetches.
 *
 * @function SubjectLoader
 * @returns {DataLoader<string, Object|null>} - A DataLoader instance that batches subject ID queries.
 */
const SubjectLoader = () => {
  // *************** creating dataloader using batch SchoolBatch
  const loader = new DataLoader(SubjectBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = SubjectLoader;
