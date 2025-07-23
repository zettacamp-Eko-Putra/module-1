// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** IMPORT MODULE ***************
const UserTypeDefs = require('../modules/user/user.typedefs');
const StudentTypeDefs = require('../modules/student/student.typedefs');
const SchoolTypeDefs = require('../modules/school/school.typedefs');
const BlockTypeDefs = require('../modules/block/block.typedefs');
const SubjectTypeDefs = require('../modules/subject/subject.typedefs');
const TestTypeDefs = require('../modules/test/test.typedefs');
const StudentTestResultTypeDefs = require('../modules/student_test_result/student_test_result.typedefs');
const TaskTypeDefs = require('../modules/task/task.typedefs');
const CalculationResultTypeDefs = require('../modules/calculation_result/calculation_result.typedefs');

// *************** Define global helper type definitions
const baseTypeDefs = gql`
  scalar Date

  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
  type UpdatedBy {
    user_id: ID
    updated_at: Date
  }

  enum OperatorEnum {
    GREATER_THAN
    GREATER_THAN_OR_EQUAL
  }

  enum LogicalOperatorEnum {
    AND
    OR
  }
`;

// *************** Combine all type definitions
const typeDefs = [
  UserTypeDefs,
  StudentTypeDefs,
  SchoolTypeDefs,
  BlockTypeDefs,
  SubjectTypeDefs,
  TestTypeDefs,
  baseTypeDefs,
  StudentTestResultTypeDefs,
  TaskTypeDefs,
  CalculationResultTypeDefs,
];

// *************** EXPORT MODULE ***************
module.exports = typeDefs;
