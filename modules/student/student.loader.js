// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const KeyBy = require('lodash/keyBy');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.models.js');

// *************** IMPORT VALIDATOR ***************
const ValidateIdMongoose = require(`../../utilities/common-validator/mongo-validator.js`);

/**
 * Batch function to load multiple students by their IDs.
 * Only returns students with status "active". If a student ID is invalid or the student is not found,
 * the corresponding result will be `null`.
 *
 * @async
 * @function StudentBatch
 * @param {Array<string|import('mongoose').Types.ObjectId>} studentIds - An array of student IDs to fetch.
 * @returns {Promise<Array<Object|null>>} - A promise that resolves to an array of student documents
 *   in the same order as the input IDs, or `null` for any not found or inactive.
 * @throws {ApolloError} - Throws an error if any of the provided IDs are not valid MongoDB ObjectIds.
 */
async function StudentBatch(studentIds) {
  // *************** validate all studentIDs
  ValidateIdMongoose(studentIds);

  // *************** find student data based on id and active status
  const students = await StudentModel.find({
    _id: { $in: studentIds },
  }).lean();

  // *************** create map from student id
  const studentMap = KeyBy(students, (student) => String(student._id));

  // *************** insert null to if the student empty
  const result = studentIds.map((id) => studentMap[String(id)] || null);

  // *************** return the data to user
  return result;
}

/**
 * Creates a DataLoader instance for batching and caching student data requests.
 * Uses the StudentBatch function to fetch multiple student records by their IDs efficiently.
 *
 * @function CreateStudentLoader
 * @returns {import('dataloader')} - A DataLoader instance configured to use the StudentBatch function.
 */
const CreateStudentLoader = () => {
  // *************** creating dataloader using batch SchoolBatch
  const loader = new DataLoader(StudentBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = CreateStudentLoader;
