// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** Subject Type
const testTypeDefs = gql`
  type Test {
    _id: ID!
    subject_id: ID!
    subject: Subject
    name: String!
    description: String!
    weight: Float!
    published_date: Date
    notations: [Notation]!
    status: TestStatus!
    published_status: PublishedStatus!
    studentTestResults: [StudentTestResult]
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

  input PublishTestInput {
    test_id: ID!
    user_id: ID!
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

  input AssignCorrectorInput {
    user_id: ID!
  }

  extend type Query {
    GetAllTests(published_status: PublishedStatus): [Test]
    GetOneTest(_id: ID!): Test
  }

  extend type Mutation {
    CreateTest(test_input: TestInput): Test!
    UpdateTest(_id: ID!, test_input: TestInput): Test
    PublishTest(task_input: PublishTestInput!): ID
    AssignCorrector(_id: ID!, task_input: AssignCorrectorInput!): ID
    DeleteTest(_id: ID!): ID
  }
`;

// *************** EXPORT MODULE ***************
module.exports = testTypeDefs;
