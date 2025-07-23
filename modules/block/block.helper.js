// *************** IMPORT MODULE ***************
const { ApolloError } = require('apollo-server');
const BlockModel = require('./block.models.js');

// *************** IMPORT UTILITIES ***************
const Compare = require('../../utilities/compare.helper.js');

async function BlockCalculation({ block, getAllSubjectResults }) {
  try {
    // *************** get block data based on block ID and status
    const blockData = await BlockModel.findOne({
      _id: block._id,
      status: 'ACTIVE',
    });

    if (!blockData) {
      throw new ApolloError('Block not found');
    }

    // *************** get total subject marks
    const totalSubjectMarks = getAllSubjectResults.reduce(
      (acc, subject) => acc + subject.total_mark,
      0
    );

    // *************** calculate average total subject mark
    const averageTotalSubjectMark = parseFloat(
      (totalSubjectMarks / getAllSubjectResults.length).toFixed(2)
    );

    // *************** set variable for comparing results
    let blockResult = 'FAIL';
    let passOneSubject = false;
    let passAverageSubject = false;
    let passSingleTest = false;

    // *************** take logical operator and condition from block data passing criteria
    const { logical_operator, condition } = blockData.passing_criteria;

    for (const criteria of condition) {
      const { condition_type, min_mark, operator } = criteria;
      // *************** doing comparison based on condition type OR
      if (logical_operator === 'OR') {
        // *************** doing comparison based on condition type single subject
        if (condition_type === 'SINGLE_SUBJECT') {
          if (!passOneSubject) {
            passOneSubject = getAllSubjectResults.some((subject) =>
              Compare(operator, subject.total_mark, min_mark)
            );
          }
        }

        // *************** doing comparison based on condition type average mark subject
        if (condition_type === 'AVERAGE_MARK_SUBJECT') {
          if (!passAverageSubject) {
            passAverageSubject = getAllSubjectResults.some((subject) =>
              Compare(operator, subject.average_mark, averageTotalSubjectMark)
            );
          }
        }

        // *************** doing comparison based on condition type single test
        if (condition_type === 'SINGLE_TEST') {
          if (!passSingleTest) {
            passSingleTest = getAllSubjectResults.some((subject) =>
              subject.test_ids.some((test) =>
                Compare(operator, test.weighted_mark, min_mark)
              )
            );
          }
        }

        // *************** check if any of the conditions passed
        if (passOneSubject || passAverageSubject || passSingleTest) {
          blockResult = 'PASS';
        }
        // *************** doing comparison based on condition type AND
      } else if (logical_operator === 'AND') {
        // *************** doing comparison for all conditions
        const allConditionPass = condition.every(
          ({ operator, min_mark, condition_type }) => {
            // *************** doing comparison based on condition type single subject
            if (condition_type === 'SINGLE_SUBJECT') {
              return getAllSubjectResults.some((subject) =>
                Compare(operator, subject.total_mark, min_mark)
              );
            }

            // *************** doing comparison based on condition type average mark subject
            if (condition_type === 'AVERAGE_MARK_SUBJECT') {
              return getAllSubjectResults.some((subject) =>
                Compare(operator, subject.average_mark, averageTotalSubjectMark)
              );
            }

            // *************** doing comparison based on condition type single test
            if (condition_type === 'SINGLE_TEST') {
              return getAllSubjectResults.some((subject) =>
                subject.test_ids.some((test) =>
                  Compare(operator, test.weighted_mark, min_mark)
                )
              );
            }
          }
        );

        // *************** check if all conditions passed
        if (allConditionPass) {
          blockResult = 'PASS';
        }
      }
    }
    const payloadBlock = {
      block_id: block._id,
      total_mark: averageTotalSubjectMark,
      block_result: blockResult,
    };

    return payloadBlock;
  } catch (error) {
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = BlockCalculation;
