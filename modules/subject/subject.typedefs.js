// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** Subject Type
const subjectTypeDefs = gql`
  type Subject {
    _id: ID!
    block_id: ID!
    block: Block
    name: String!
    description: String!
    coefficient: Float!
    test_ids: [Test]
    status: SubjectStatus!
    passing_criteria: [SubjectPassingCriteria]
    created_at: Date
    created_by: ID
    updated_by: [UpdatedBy]
    deleted_at: Date
    deleted_by: ID
  }

  type SubjectCondition {
    condition_type: SubjectConditionTypeEnum
    test_id: [Test]
    min_mark: Int
    operator: OperatorEnum
  }

  type SubjectPassingCriteria {
    logical_operator: LogicalOperatorEnum
    condition: [SubjectCondition]
  }

  enum SubjectConditionTypeEnum {
    SINGLE_TEST
    AVERAGE_MARK_TEST
  }

  enum SubjectStatus {
    ACTIVE
    DELETED
  }

  input SubjectInput {
    block_id: ID!
    name: String!
    description: String!
    coefficient: Float!
    passing_criteria: SubjectPassingCriteriaInput
  }

  input SubjectPassingCriteriaInput {
    logical_operator: LogicalOperatorEnum
    condition: [SubjectConditionInput]
  }

  input SubjectConditionInput {
    condition_type: SubjectConditionTypeEnum
    test_id: ID
    min_mark: Int
    operator: OperatorEnum
  }

  extend type Query {
    GetAllSubjects: [Subject]
    GetOneSubject(_id: ID!): Subject
  }

  extend type Mutation {
    CreateSubject(subject_input: SubjectInput): Subject!
    UpdateSubject(_id: ID!, subject_input: SubjectInput): Subject
    DeleteSubject(_id: ID!): ID
  }
`;

// *************** EXPORT MODULE ***************
module.exports = subjectTypeDefs;
