// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** IMPORT MODULE ***************
const UserTypeDefs = require('../modules/user/user.typedefs');
const StudentTypeDefs = require('../modules/student/student.typedefs');
const SchoolTypeDefs = require('../modules/school/school.typedefs');

// *************** Define global helper type definitions
const baseTypeDefs = gql`
  scalar Date

  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

// *************** Combine all type definitions
const typeDefs = [
  UserTypeDefs,
  StudentTypeDefs,
  SchoolTypeDefs,
  baseTypeDefs,
];

// *************** EXPORT MODULE ***************
module.exports = typeDefs;
