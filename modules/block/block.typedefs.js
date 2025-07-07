// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** Block Type
const blockTypeDefs = gql`
  type Block {
    _id: ID!
    name: String!
    description: String!
    subject_ids: [Subject]
    status: BlockStatus!
    created_at: Date
    created_by: ID
    updated_by: [UpdatedBy]
    deleted_at: Date
    deleted_by: ID
  }

  type UpdatedBy {
    user_id: ID
    updated_at: Date
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
