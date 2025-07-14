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
