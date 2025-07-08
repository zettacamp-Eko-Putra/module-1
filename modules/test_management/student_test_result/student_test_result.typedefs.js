// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** Subject Type
const studentTestResultTypeDefs = gql`
  type StudentTestResult {
    _id: ID!
    student_id: Student!
    test_id: Test!
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

  input StudentTestResultInput {
    student_id: ID!
    test_id: ID!
    marks: [MarksInput]!
    task_id: ID
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
    UpdateMarksForStudentTestResult(
      _id: ID!
      student_test_result_input: StudentTestResultInput!
    ): StudentTestResult

    DeleteStudentTestResult(_id: ID!): ID
  }
`;

// *************** EXPORT MODULE ***************
module.exports = studentTestResultTypeDefs;
