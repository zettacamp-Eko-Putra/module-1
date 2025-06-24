// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** User Type
const userTypeDefs = gql`
  type UserAddress {
    street: String!
    city: String!
    province: String!
    postal_code: String!
  }

  type User {
    _id: ID!
    first_name: String!
    last_name: String!
    civility: String!
    office_phone: String
    direct_line: String
    mobile_phone: String
    entity: String!
    address: [UserAddress]!
    email: String!
    role: String!
    status: String!
    created_at: Date
    updated_at: Date
    deleted_at: Date
  }

  input UserAddressInput {
    street: String!
    city: String!
    province: String!
    postal_code: String!
  }

  input UserInput {
    first_name: String!
    last_name: String!
    civility: String!
    office_phone: String
    direct_line: String
    mobile_phone: String!
    entity: String!
    address: [UserAddressInput]!
    email: String!
    password: String!
    role: String!
  }

  extend type Query {
    GetAllUsers: [User]
    GetOneUser(_id: ID!): User
  }

  extend type Mutation {
    CreateUser(user_input: UserInput!): User!
    UpdateUser(_id: ID!, user_input: UserInput!): User
    DeleteUser(_id: ID!): ID
  }
`;

// *************** EXPORT MODULE ***************
module.exports = userTypeDefs;
