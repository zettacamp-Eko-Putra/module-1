// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** Subject Type
const testTypeDefs = gql`
  type Test {
    _id: ID!
    subject_id: ID!
    name: String!
    description: String!
    weight: Float!
    published_date: Date
    notations: [Notation]!
    status: TestStatus!
    published_status: PublishedStatus!
    created_at: Date
    created_by: ID
    updated_by: [UpdatedBy]
    deleted_at: Date
    deleted_by: ID
  }

  type Notation {
    notation_text: String!
    max_point: Float!
  }

  type UpdatedBy {
    user_id: ID
    updated_at: Date
  }
  enum TestStatus {
    ACTIVE
    DELETED
  }
  enum PublishedStatus {
    NOT_PUBLISHED
    PUBLISHED
  }

  input TestInput {
    subject_id: ID!
    name: String!
    description: String!
    weight: Float!
    notations: [NotationInput]!
    published_date: Date
  }

  input NotationInput {
    notation_text: String!
    max_point: Float!
  }

  extend type Query {
    GetAllTests(published_status: PublishedStatus): [Test]
    GetOneTest(_id: ID!): Test
  }

  extend type Mutation {
    CreateTest(test_input: TestInput): Test!
    UpdateTest(_id: ID!, test_input: TestInput): Test
    DeleteTest(_id: ID!): ID
  }
`;

// *************** EXPORT MODULE ***************
module.exports = testTypeDefs;
