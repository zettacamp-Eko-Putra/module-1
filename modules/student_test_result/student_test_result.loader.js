// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const GroupBy = require('lodash/groupBy');

// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('./student_test_result.models.js');

/**
 * Batch function to load StudentTestResults grouped by test_id.
 *
 * @param {string[]} testIds - List of Test IDs
 * @returns {Promise<Array<Array<Object>>>} - List of student test result arrays per test
 */
async function BatchStudentTestResultsByTestId(testIds) {
  // *************** validate all studentIDs
  ValidateArrayIdMongoose(testIds, 'Test Ids');

  // *************** find all student test results with given test ids
  const results = await StudentTestResultModel.find({
    test_id: { $in: testIds },
    status: 'ACTIVE',
  }).lean();

  // *************** group result by test_id
  const groupedResults = GroupBy(results, (item) => String(item.test_id));

  // *************** return ordered results based on input order
  return testIds.map((testId) => groupedResults[testId] || []);
}

/**
 * Initializes a new DataLoader to batch load student test results by test_id.
 *
 * @returns {DataLoader<string, Object[]>} - A DataLoader instance
 */
const StudentTestResultLoader = () => {
  const loader = new DataLoader(BatchStudentTestResultsByTestId);
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = StudentTestResultLoader;
