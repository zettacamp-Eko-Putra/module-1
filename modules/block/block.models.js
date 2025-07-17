// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { Schema } = mongoose;

// *************** MODEL Schema: Block
const BlockSchema = new Schema(
  {
    // Name for the block
    name: { type: String, required: true },

    // Description for the block
    description: { type: String, required: true },

    // subject ids inside the block
    subject_ids: [{ type: Schema.Types.ObjectId, ref: 'subject' }],

    // Status for the block
    status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' },

    // Passing criteria for the block
    passing_criteria: [
      {
        // logical operator for passing criteria
        logical_operator: { type: String, enum: ['OR', 'AND'] },

        // condition passing criteria for the block
        condition: [
          {
            // condition type for block passing criteria condition
            condition_type: {
              type: String,
              enum: ['SINGLE_SUBJECT', 'AVERAGE_MARK_SUBJECT', 'SINGLE_TEST'],
              required: true,
            },
            // subject id for condition and type SINGLE_SUBJECT, AVERAGE_MARK_SUBJECT
            subject_id: [{ type: Schema.Types.ObjectId, ref: 'subject' }],

            // test id for condition and type SINGLE_TEST
            test_id: [{ type: Schema.Types.ObjectId, ref: 'test' }],

            // minimum mark for condition
            min_mark: { type: Number, required: true },

            // enum operator to compare with min_mark
            operator: {
              type: String,
              enum: ['GREATER_THAN', 'GREATER_THAN_OR_EQUAL'],
              required: true,
            },
          },
        ],
      },
    ],

    // user id who create the block
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // user id and time who update the block
    updated_by: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: 'user' },
        updated_at: { type: Date, default: Date.now },
      },
    ],

    // user id who delete the block
    deleted_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // Delete at for the block
    deleted_at: { type: Date },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('block', BlockSchema);
