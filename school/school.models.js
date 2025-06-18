// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// *************** MODEL Schema: School Address
const SchoolAddressSchema = new Schema({
  // Name of street school location
  street: String,

  // Name of city school location
  city: String,

  // Name of province school location
  province: String,

  // Number of postal_code school location
  postal_code: String,
});

// *************** MODEL Schema: School
const schoolSchema = new Schema({
  // the legal name for the school
  school_legal_name: { type: String, required: true },

  // the commercial name for the school
  school_commercial_name: { type: String, required: true },

  // address for the school
  address: [SchoolAddressSchema],

  // Students associated with the school
  students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],

  // School status
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },

  // delete at for the school
  deleted_at: { type: Date },
});

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('School', schoolSchema, 'school');
