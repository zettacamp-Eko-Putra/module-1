// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { Schema } = mongoose;

// *************** MODEL Schema: Test
const TestSchema = new Schema(
  {
    // subject id test belong to
    subject_id: { type: Schema.Types.ObjectId, ref: 'subject', required: true },

    // Name for the test
    name: { type: String, required: true },

    // Description for the test
    description: { type: String, required: true },

    // Coefficient for the test
    weight: { type: Number, required: true },

    // notations inside the test
    notations: [
      {
        notation_text: { type: String, required: true },
        max_point: { type: Number, required: true },
      },
    ],

    // Status for the test
    status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' },

    // published Status for the test
    published_status: {
      type: String,
      enum: ['PUBLISHED', 'NOT_PUBLISHED'],
      default: 'NOT_PUBLISHED',
    },

    // published date for the test
    published_date: { type: Date },

    // Passing criteria for the test
    passing_criteria: [
      {
        // enum condition outcome for the passing criteria
        condition_outcome: {
          type: String,
          enum: ['PASS', 'FAIL'],
          required: true,
        },

        // minimum mark for passing criteria
        min_mark: { type: Number, required: true },

        // enum operator to compare with min_mark
        operator: {
          type: String,
          enum: ['GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN'],
          required: true,
        },
      },
    ],

    // user id who create the test
    created_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // user id and time who update the test
    updated_by: [
      {
        user_id: { type: Schema.Types.ObjectId, ref: 'user' },
        updated_at: { type: Date, default: Date.now },
      },
    ],

    // user id who delete the test
    deleted_by: { type: Schema.Types.ObjectId, ref: 'user' },

    // Delete at for the test
    deleted_at: { type: Date },
  },
  {
    timestamps: {
      createdAt: 'created_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('test', TestSchema);
