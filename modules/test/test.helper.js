// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('../student_test_result/student_test_result.models');
const TestModel = require('../test/test.models');

// *************** IMPORT HELPER FUNCTION ***************
const Compare = require('../../utilities/compare.helper');

/**
 * Function: TestCalculation
 * Purpose: Calculate the test result for a given test based on student average marks and test weight.
 * @param {Object} test - The test object containing at least the _id field.
 * @returns {Object} - The test result including status (PASS/FAIL), average mark, and weighted mark.
 */
async function TestCalculation(test) {
  // *************** Get student's average mark for the test
  const studentTestResultAverageMark = await StudentTestResultModel.findOne({
    test_id: test._id,
    status: 'ACTIVE',
    validation_status: 'VALIDATED',
  }).select('average_mark');

  // *************** Get test data including weight and passing criteria
  const testData = await TestModel.findOne({
    _id: test._id,
    status: 'ACTIVE',
    published_status: 'PUBLISHED',
  });

  // *************** Calculate the weighted mark
  const weightedMark = studentTestResultAverageMark * testData.weight;

  // Default test result is FAIL
  let testResult = 'FAIL';

  // Destructure passing criteria from test data
  const { operator, min_mark } = testData.passing_criteria;

  // *************** Check if the student passed based on passing criteria
  const passOneTest = Compare(operator, weightedMark, min_mark);

  if (passOneTest) {
    testResult = 'PASS';
  }

  // *************** Return calculated test result
  return {
    test_id: test._id,
    subject_id: testData.subject_id,
    test_result: testResult,
    average_mark: studentTestResultAverageMark,
    weighted_mark: weightedMark,
  };
}

// *************** EXPORT FUNCTION ***************
module.exports = TestCalculation;
