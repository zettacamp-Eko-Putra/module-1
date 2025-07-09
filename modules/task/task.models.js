// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { Schema } = mongoose;

// *************** MODEL Schema: Task ***************
const TaskSchema = new Schema(
  {
    // test id task belong to
    test_id: { type: Schema.Types.ObjectId, ref: 'test' },

    // user id who been assign to the task
    user_id: { type: Schema.Types.ObjectId, ref: 'user' },

    // type of the task
    type: {
      type: String,
      enum: ['ASSIGN_CORRECTOR', 'ENTER_MARKS', 'VALIDATE_MARKS'],
    },

    // Status for the task
    status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' },

    // type of the task
    task_status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
    },

    // due date of the task
    due_date: { type: Date },

    // user id who create the task
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // user id and time who update the task
    updated_by: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: 'user' },
        updated_at: { type: Date, default: Date.now },
      },
    ],

    // user id who delete the task
    deleted_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // Delete at for the task
    deleted_at: { type: Date },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('task', TaskSchema);
