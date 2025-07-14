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
