// *************** IMPORT MODULE ***************
const { ApolloError } = require('apollo-server');
const SubjectModel = require('../subject/subject.models.js');
const StudentTestResultModel = require('../student_test_result/student_test_result.models.js');

// *************** IMPORT HELPER FUNCTION ***************
const Compare = require('../../utilities/compare.helper.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

/**
 * Calculates the subject result for a student based on test performance and subject criteria.
 *
 * This function performs several steps:
 * - Validates subject existence.
 * - Aggregates student test results by `test_id`.
 * - Calculates weighted average and total marks.
 * - Evaluates passing criteria using logical operators (AND/OR) and conditions (SINGLE_TEST or AVERAGE_MARK_TEST).
 *
 * @async
 * @function SubjectCalculation
 * @param {Object} params - Function parameters.
 * @param {Object} params.subject - The subject object containing at least `_id`.
 * @param {Array<Object>} params.getAllTestResults - Array of test results with at least `test_id` and `weightedMark`.
 * @returns {Promise<Object>} An object containing subject result information.
 *
 * @throws {ApolloError} If subject is not found, test results are missing, or any processing error occurs.
 */
async function SubjectCalculation({ subject, getAllTestResults }) {
  try {
    // *************** Get subject data based on subject ID and status
    const subjectData = await SubjectModel.findOne({
      _id: subject._id,
      status: 'ACTIVE',
    });

    if (!subjectData) {
      throw new ApolloError('Subject not found');
    }

    // *************** get all test IDs from the test results
    const testIds = getAllTestResults.map((test) => test.test_id);

    ValidateArrayIdMongoose(testIds, 'Test Ids');

    // *************** Get student's average marks for the tests
    const studentTestResultsAverageMark = await StudentTestResultModel.find({
      test_id: { $in: testIds },
      status: 'ACTIVE',
    }).select('average_mark');

    if (!studentTestResultsAverageMark) {
      throw new ApolloError('Student test results not found');
    }

    // *************** calculate total weighted mark
    const totalWeightedMark = getAllTestResults.reduce(
      (acc, test) => acc + test.weighted_mark,
      0
    );

    // *************** get average from total weighted mark
    const testAverage = totalWeightedMark / getAllTestResults.length;

    // *************** calculate total mark based on subject coefficient
    const totalMark = parseFloat(
      (testAverage * subjectData.coefficient).toFixed(2)
    );

    // *************** calculate average mark from student test results
    const averageTestMark =
      studentTestResultsAverageMark.reduce(
        (acc, res) => acc + res.average_mark,
        0
      ) / studentTestResultsAverageMark.length;

    // *************** set variable for comparing results
    let subjectResult = 'FAIL';
    let passOneTest = false;
    let passAverageTest = false;

    // *************** take logical operator and condition from subject data
    const { logical_operator, condition } = subjectData.passing_criteria;

    // *************** doing comparison if the logical operator is OR
    if (logical_operator === 'OR') {
      for (const criteria of condition) {
        // *************** take operator, min_mark, and condition_type from criteria
        const { operator, min_mark, condition_type } = criteria;

        // *************** doing comparison if the condition type is SINGLE_TEST
        if (condition_type === 'SINGLE_TEST') {
          if (!passOneTest) {
            passOneTest = getAllTestResults.some((test) =>
              Compare(operator, test.weightedMark, min_mark)
            );
          }
        }

        // *************** doing comparison if the condition type is AVERAGE_MARK_TEST
        if (condition_type === 'AVERAGE_MARK_TEST') {
          if (!passAverageTest) {
            passAverageTest = studentTestResultsAverageMark.some((result) =>
              Compare(operator, result.average_mark, averageTestMark)
            );
          }
        }

        // *************** check if any of the conditions passed
        if (passOneTest || passAverageTest) {
          subjectResult = 'PASS';
        }
      }

      // *************** doing comparison if the logical operator is AND
    } else if (logical_operator === 'AND') {
      // *************** doing comparison for each condition
      const allConditionPass = subjectData.passing_criteria.condition.every(
        ({ operator, min_mark, condition_type }) => {
          // *************** doing comparison if the condition type is SINGLE_TEST
          if (condition_type === 'SINGLE_TEST') {
            return getAllTestResults.some((test) =>
              Compare(operator, test.weightedMark, min_mark)
            );
          }

          // *************** doing comparison if the condition type is AVERAGE_MARK_TEST
          if (condition_type === 'AVERAGE_MARK_TEST') {
            return studentTestResultsAverageMark.some((result) =>
              Compare(operator, result.average_mark, averageTestMark)
            );
          }
        }
      );

      // *************** check if all conditions passed
      if (allConditionPass) {
        subjectResult = 'PASS';
      }
    }

    const payloadSubject = {
      block_id: subject.block_id,
      subject_id: subject._id,
      total_mark: totalMark,
      subject_result: subjectResult,
    };

    return payloadSubject;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = SubjectCalculation;
