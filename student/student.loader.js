// *************** IMPORT MODULE ***************
const StudentModel = require('./student.models.js');

// *************** IMPORT LIBRARY ***************
const dataLoader = require('dataloader');
const keyBy = require('lodash/keyBy');

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
  // *************** find student data
  const students = await StudentModel.find({
    // *************** find active student data based on id
    _id: { $in: studentIds },
    status: 'active',
  }).lean();

  // *************** create map from student id
  const studentMap = keyBy(students, (student) => student._id.toString());

  // *************** insert null to if the student empty
  const result = studentIds.map((id) => studentMap[id.toString()] || null);

  // *************** return the data to user
  return result;
}

/**
 * Membuat instance DataLoader untuk mengambil data student secara efisien menggunakan fungsi batch.
 * DataLoader membantu mengurangi jumlah query ke database dengan melakukan batching dan caching.
 *
 * @function CreateStudentLoader
 * @returns {DataLoader<string|import('mongoose').Types.ObjectId, Object|null>} - Instance DataLoader untuk student.
 */
const CreateStudentLoader = () => {
  // *************** creating dataloader using batch SchoolBatch
  const loader = new dataLoader(StudentBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = CreateStudentLoader;
