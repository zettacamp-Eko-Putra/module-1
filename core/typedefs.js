// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** IMPORT MODULE ***************
const UserTypeDefs = require('../modules/user/user.typedefs');
const StudentTypeDefs = require('../modules/student/student.typedefs');
const SchoolTypeDefs = require('../modules/school/school.typedefs');
const BlockTypeDefs = require('../modules/block/block.typedefs');
const subjectTypeDefs = require('../modules/subject/subject.typedefs');
const testTypeDefs = require('../modules/test/test.typedefs');
const studentTestResultTypeDefs = require('../modules/test_management/student_test_result/student_test_result.typedefs');

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
`;

// *************** Combine all type definitions
const typeDefs = [
  UserTypeDefs,
  StudentTypeDefs,
  SchoolTypeDefs,
  BlockTypeDefs,
  subjectTypeDefs,
  testTypeDefs,
  baseTypeDefs,
  studentTestResultTypeDefs,
];

// *************** EXPORT MODULE ***************
module.exports = typeDefs;
