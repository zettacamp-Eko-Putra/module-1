// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { Schema } = mongoose;

// *************** MODEL Schema: Block ***************
const StudentTestResultSchema = new Schema(
  {
    // student id student_test_result belong to
    student_id: { type: Schema.Types.ObjectId, ref: 'student', required: true },

    // test id student_test_result belong to
    test_id: { type: Schema.Types.ObjectId, ref: 'test', required: true },

    // user who will validate the mark
    mark_validator_id: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },

    // marks inside the test
    marks: [
      {
        notation_text: { type: String, required: true },
        mark: { type: Number, required: true },
      },
    ],

    // average mark for calculation
    average_mark: { type: Number },

    // task id when marks been entered
    task_id: { type: Schema.Types.ObjectId, ref: 'task' },

    // mark entry date for the student_test_result
    mark_entry_date: { type: Date },

    // Status for the student_test_result
    status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' },

    // validation Status for the student_test_result
    validation_status: {
      type: String,
      enum: ['VALIDATED', 'NOT_VALIDATED'],
      default: 'NOT_VALIDATED',
    },

    // user id who create the student_test_result
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // user id and time who update the student_test_result
    updated_by: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: 'user' },
        updated_at: { type: Date, default: Date.now },
      },
    ],

    // user id who delete the student_test_result
    deleted_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // Delete at for the student_test_result
    deleted_at: { type: Date },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('student_test_result', StudentTestResultSchema);
