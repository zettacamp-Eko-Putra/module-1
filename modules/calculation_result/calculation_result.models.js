// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// *************** MODEL Schema: calculation result
const CalculationResultSchema = new Schema(
  {
    // Student ID this calculation result belongs to
    student_id: { type: Schema.Types.ObjectId, ref: 'student' },

    // Final overall result after checking all blocks (PASS / FAIL)
    overall_result: { type: String, enum: ['PASS', 'FAIL'] },

    // Status of this calculation result (active or soft-deleted)
    status: { type: String, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' },

    // Result breakdown per block
    results: [
      {
        // Block ID this result belongs to
        block_id: { type: Schema.Types.ObjectId, ref: 'block' },

        // Result for this block (PASS / FAIL)
        block_result: { type: String, enum: ['PASS', 'FAIL'] },

        // Total mark for the block after calculation
        total_mark: { type: Number },

        // Result breakdown per subject within the block
        subject_results: [
          {
            // Subject ID this result belongs to
            subject_id: { type: Schema.Types.ObjectId, ref: 'subject' },

            // Result for this subject (PASS / FAIL)
            subject_result: { type: String, enum: ['PASS', 'FAIL'] },

            // Total mark for the subject after calculation
            total_mark: { type: Number },

            // Result breakdown per test within the subject
            test_results: [
              {
                // Test ID this result belongs to
                test_id: { type: Schema.Types.ObjectId, ref: 'test' },

                // Result for this test (PASS / FAIL)
                test_result: { type: String, enum: ['PASS', 'FAIL'] },

                // Average score of the test based on notations
                average_mark: { type: Number },

                // Final weighted mark of the test (average × weight)
                weighted_mark: { type: Number },
              },
            ],
          },
        ],
      },
    ],

    // Metadata: who updated this result and when
    updated_by: [
      {
        // User ID who updated the result
        user_id: { type: Schema.Types.ObjectId, ref: 'user' },

        // Time when the update was made
        updated_at: { type: Date, default: Date.now },
      },
    ],

    // Soft-delete timestamp
    deleted_at: { type: Date },

    // User ID who deleted this result
    deleted_by: { type: Schema.Types.ObjectId, ref: 'user' },
  },
  {
    // Enable automatic created_at and updated_at
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('calculation_result', CalculationResultSchema);
