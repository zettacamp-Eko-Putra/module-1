// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { Schema } = mongoose;

// *************** MODEL Schema: Subject
const SubjectSchema = new Schema(
  {
    // block id subject belong to
    block_id: { type: Schema.Types.ObjectId, ref: 'block' },

    // Name for the subject
    name: { type: String, required: true },

    // Description for the subject
    description: { type: String, required: true },

    // Coefficient for the subject
    coefficient: { type: Number, required: true },

    // test ids inside the subject
    test_ids: [{ type: Schema.Types.ObjectId, ref: 'test' }],

    // Status for the subject
    status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' },

    // Passing criteria for the subject
    passing_criteria: [
      {
        // logical operator for passing criteria
        logical_operator: { type: String, enum: ['OR', 'AND'], required: true },

        // condition passing criteria for the subject
        condition: [
          {
            // enum condition outcome for the condition
            condition_outcome: {
              type: String,
              enum: ['PASS', 'FAIL'],
              required: true,
            },
            // condition type for subject passing criteria condition
            condition_type: {
              type: String,
              enum: ['SINGLE_TEST', 'AVERAGE_MARK_TEST'],
              required: true,
            },

            // test id for condition type
            test_id: [{ type: Schema.Types.ObjectId, ref: 'test' }],

            // minimum mark for condition
            min_mark: { type: Number, required: true },

            // enum operator to compare with min_mark
            operator: {
              type: String,
              enum: ['GREATER_THAN', 'GREATER_THAN_OR_EQUAL', ' LESS_THAN'],
              required: true,
            },
          },
        ],
      },
    ],

    // user id who create the subject
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // user id and time who update the subject
    updated_by: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: 'user' },
        updated_at: { type: Date, default: Date.now },
      },
    ],

    // user id who delete the subject
    deleted_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // Delete at for the subject
    deleted_at: { type: Date },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('subject', SubjectSchema);
