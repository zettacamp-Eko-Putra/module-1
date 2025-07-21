// *************** IMPORT MODULE ***************
const StudentTestResultModel = require('../student_test_result/student_test_result.models.js');
const SubjectModel = require('../subject/subject.models.js');
const BlockModel = require('../block/block.models.js');
const CalculationResultModel = require('./calculation_result.models.js');

// *************** IMPORT HELPER ***************
const TestCalculation = require('../test/test.helper.js');
const SubjectCalculation = require('../subject/subject.helper.js');
const BlockCalculation = require('../block/block.helper.js');

/**
 * Calculates and stores the overall test, subject, and block results for a student.
 *
 * This function performs a full aggregation and evaluation process:
 * - Retrieves all validated test results for the student.
 * - Calculates test-level performance using `TestCalculation`.
 * - Aggregates subject-level results via `SubjectCalculation`.
 * - Aggregates block-level results via `BlockCalculation`.
 * - Determines the overall result (PASS/FAIL) based on block performance.
 * - Saves the full calculation result to the database.
 *
 * @async
 * @function CalculateStudentTestResult
 * @param {string} studentId - The MongoDB ObjectId of the student whose results are to be calculated.
 * @returns {Promise<void>} No return value; result is stored in the database.
 *
 * @throws {ApolloError} If any step in the data retrieval or calculation process fails.
 */
async function CalculateStudentTestResult(studentId) {
  try {
    // *************** get all student test resulsts based on student id and status
    const getAllStudentTestResults = await StudentTestResultModel.find({
      student_id: studentId,
      status: 'ACTIVE',
      validation_status: 'VALIDATED',
    }).lean();

    // *************** calculate test results for each test
    const getAllTestResults = await Promise.all(
      getAllStudentTestResults.map((test) => TestCalculation(test))
    );

    // *************** get all subject ids from test results
    const subjectIds = getAllStudentTestResults.map((test) => test.subject_id);

    // *************** get all subjects based on subject ids and status
    const getAllSubjects = await SubjectModel.find({
      _id: { $in: subjectIds },
      status: 'ACTIVE',
    });

    // *************** calculate subject results for each subject
    const getAllSubjectResults = await Promise.all(
      getAllSubjects.map((subject) =>
        SubjectCalculation({ subject, getAllTestResults })
      )
    );

    // *************** get all block ids from subjects
    const blockIds = getAllSubjects.map((subject) => subject.block_id);

    // *************** get all blocks based on block ids and status
    const getAllBlocks = await BlockModel.find({
      _id: { $in: blockIds },
      status: 'ACTIVE',
    });

    // *************** calculate block results for each block
    const getAllBlockResults = await Promise.all(
      getAllBlocks.map((block) =>
        BlockCalculation({ block, getAllSubjectResults })
      )
    );

    // *************** check overall result based on block results
    const overalResult = getAllBlockResults.every(
      (block) => block.block_result === 'PASS'
    )
      ? 'PASS'
      : 'FAIL';

    // *************** create calculation result input
    const calculationReseultInput = {
      student_id: studentId,
      test_results: getAllTestResults,
      subject_results: getAllSubjectResults,
      block_results: getAllBlockResults,
      overal_result: overalResult,
    };

    // *************** create calculation result in database
    await CalculationResultModel.create(calculationReseultInput);
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = CalculateStudentTestResult;
