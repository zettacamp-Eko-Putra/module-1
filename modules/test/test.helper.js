// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

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
async function TestCalculation(studentTestResult) {
  try {
    const { test_id, average_mark } = studentTestResult;

    // *************** Get test data including weight and passing criteria
    const testData = await TestModel.findOne({
      _id: test_id,
      status: 'ACTIVE',
      published_status: 'PUBLISHED',
    });

    if (!testData) {
      throw new ApolloError('test not found');
    }

    // *************** Calculate the weighted mark
    const weightedMark = average_mark * testData.weight;

    // Default test result is FAIL
    let testResult = 'FAIL';

    // Destructure passing criteria from test data
    const { operator, min_mark } = testData.passing_criteria;

    // *************** Check if the student passed based on passing criteria
    const passOneTest = Compare(operator, weightedMark, min_mark);

    if (passOneTest) {
      testResult = 'PASS';
    }
    const payloadTest = {
      test_id,
      subject_id: testData.subject_id,
      test_result: testResult,
      average_mark,
      weighted_mark: weightedMark,
    };

    // *************** Return calculated test result
    return payloadTest;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT FUNCTION ***************
module.exports = TestCalculation;
