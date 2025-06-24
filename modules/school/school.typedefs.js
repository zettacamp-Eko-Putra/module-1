// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** School type
const schoolTypeDefs = gql`
  type SchoolAddress {
    street: String!
    city: String!
    province: String!
    postal_code: String!
  }

  type School {
    _id: ID!
    school_legal_name: String!
    school_commercial_name: String!
    address: [SchoolAddress]
    students: [Student]
    status: String!
    created_at: Date
    updated_at: Date
    deleted_at: Date
  }

  input SchoolAddressInput {
    street: String!
    city: String!
    province: String!
    postal_code: String!
  }

  input SchoolInput {
    school_legal_name: String!
    school_commercial_name: String!
    address: [SchoolAddressInput]!
  }

  extend type Query {
    GetAllSchools: [School]
    GetOneSchool(_id: ID!): School
  }

  extend type Mutation {
    CreateSchool(school_input: SchoolInput!): School!
    UpdateSchool(_id: ID!, school_input: SchoolInput!): School
    DeleteSchool(_id: ID!): ID
  }
`;

// *************** EXPORT MODULE ***************
module.exports = schoolTypeDefs;
