// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** User Type
const calculationResultTypeDefs = gql`
  type CalculationResult {
    _id: ID!
    student_id: ID!
    overall_result: ResultEnum
    status: CalculationResultStatus
    results: [Results]
    created_at: Date
    updated_by: [UpdatedBy]
    deleted_at: Date
    deleted_by: ID
  }

  type Results {
    block_id: ID
    block_result: ResultEnum
    total_mark: Float
    subject_results: [SubjectResults]
  }

  type SubjectResults {
    subject_id: ID
    subject_result: ResultEnum
    total_mark: Float
    test_results: [TestResults]
  }

  type TestResults {
    test_id: ID
    test_result: ResultEnum
    average_mark: Float
    weighted_mark: Float
  }

  enum ResultEnum {
    PASS
    FAIL
  }

  enum CalculationResultStatus {
    ACTIVE
    DELETED
  }

  extend type Query {
    GetAllCalculationResults: [CalculationResult]
    GetOneCalculationResult(_id: ID!): CalculationResult
  }
`;

// *************** EXPORT MODULE ***************
module.exports = calculationResultTypeDefs;
