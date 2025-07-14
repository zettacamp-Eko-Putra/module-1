// *************** IMPORT LIBRARY ***************
const { gql } = require('apollo-server');

// *************** Task typedef
const taskTypeDefs = gql`
  type Task {
    _id: ID!
    test_id: ID
    test: Test
    user_id: ID
    user: User
    type: TypeTask!
    task_status: TaskStatus!
    status: Status
    due_date: Date
    created_at: Date
    created_by: ID
    updated_by: [UpdatedBy]
    deleted_at: Date
    deleted_by: ID
  }

  enum TypeTask {
    ASSIGN_CORRECTOR
    ENTER_MARKS
    VALIDATE_MARKS
  }

  enum Status {
    ACTIVE
    DELETED
  }

  enum TaskStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
  }

  input TaskInput {
    test_id: ID
    user_id: ID
    due_date: Date
  }

  extend type Query {
    GetAllTasks(type: TypeTask, task_status: TaskStatus): [Task]
    GetOneTask(_id: ID): Task
  }

  extend type Mutation {
    UpdateTask(_id: ID!, task_input: TaskInput!): Task
    DeleteTask(_id: ID!): ID
  }
`;

// *************** EXPORT MODULE ***************
module.exports = taskTypeDefs;
