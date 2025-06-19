// *************** IMPORT LIBRARY ***************
const dataLoader = require('dataloader');
const keyBy = require('lodash/keyBy');
const { Types } = require('mongoose');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.models.js');

/**
 * Batch function for loading multiple students by their IDs using DataLoader.
 * Only returns students with status "active". If a student ID is not found or is inactive,
 * the corresponding result will be `null`.
 *
 * @async
 * @function StudentBatch
 * @param {Array<string|ObjectId>} studentId - An array of student IDs to fetch.
 * @returns {Promise<Array<Object|null>>} - An array of student documents in the same order as input IDs, or `null` if not found.
 */
async function StudentBatch(studentIds) {
  // *************** validate all studentIDs
  const invalidStudentId = studentIds.filter(
    (ids) => !Types.ObjectId.isValid(ids)
  );
  if (invalidStudentId.length) {
    throw new Error(`Invalid student IDs: ${invalidStudentId.join(', ')}`);
  }

  // *************** find student data
  const students = await StudentModel.find({
    // *************** find active student data based on id
    _id: { $in: studentIds },
    status: 'active',
  }).lean();

  // *************** create map from student id
  const studentMap = keyBy(students, (student) => String(student._id));

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
  const loader = new dataLoader(StudentBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = CreateStudentLoader;
