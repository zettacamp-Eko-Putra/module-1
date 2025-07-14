// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** Student Test Result Type
const studentTestResultTypeDefs = gql`
  type StudentTestResult {
    _id: ID!
    student_id: Student!
    test_id: Test!
    task_id: ID!
    mark_validator_id: ID!
    marks: [Marks!]!
    average_mark: Float
    mark_entry_date: Date
    status: StudentTestResultStatus!
    validation_status: ValidationStatus!
    created_at: Date
    created_by: ID
    updated_by: [UpdatedBy]
    deleted_at: Date
    deleted_by: ID
  }

  type Marks {
    notation_text: String!
    mark: Float!
  }

  enum StudentTestResultStatus {
    ACTIVE
    DELETED
  }

  enum ValidationStatus {
    VALIDATED
    NOT_VALIDATED
  }

  input EnterStudentTestResultInput {
    student_id: ID!
    test_id: ID!
    user_id: ID!
    marks: [MarksInput]!
  }

  input UpdateStudentTestResultInput {
    marks: [MarksInput]!
  }

  input MarksInput {
    notation_text: String!
    mark: Float!
  }

  extend type Query {
    GetAllStudentTestResults: [StudentTestResult]
    GetOneStudentTestResult(_id: ID!): StudentTestResult
  }

  extend type Mutation {
    EnterMarksForStudentTestResult(
      _id: ID!
      task_input: EnterStudentTestResultInput!
    ): StudentTestResult
    UpdateMarksForStudentTestResult(
      _id: ID!
      student_test_result_input: UpdateStudentTestResultInput!
    ): StudentTestResult
    ValidateMarks(_id: ID!, student_test_result_id: ID!): ID
    DeleteStudentTestResult(_id: ID!): ID
  }
`;

// *************** EXPORT MODULE ***************
module.exports = studentTestResultTypeDefs;
