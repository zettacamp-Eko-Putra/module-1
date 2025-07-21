// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** Block Type
const blockTypeDefs = gql`
  type Block {
    _id: ID!
    name: String!
    description: String!
    subject_ids: [Subject]
    passing_criteria: [PassingCriteria]
    status: BlockStatus!
    created_at: Date
    created_by: ID
    updated_by: [UpdatedBy]
    deleted_at: Date
    deleted_by: ID
  }

  type BlockCondition {
    condition_type: BlockConditionTypeEnum
    subject_id: [Subject]
    test_id: [Test]
    min_mark: Int
    operator: OperatorEnum
  }

  enum BlockConditionTypeEnum {
    SINGLE_SUBJECT
    AVERAGE_MARK_SUBJECT
    SINGLE_TEST
  }

  enum BlockStatus {
    ACTIVE
    DELETED
  }

  input BlockInput {
    name: String!
    description: String!
  }

  extend type Query {
    GetAllBlocks: [Block]
    GetOneBlock(_id: ID!): Block
  }

  extend type Mutation {
    CreateBlock(block_input: BlockInput): Block!
    UpdateBlock(_id: ID!, block_input: BlockInput): Block
    DeleteBlock(_id: ID!): ID
  }
`;

// *************** EXPORT MODULE ***************
module.exports = blockTypeDefs;
