// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { Schema } = mongoose;

// *************** MODEL Schema: Student Address
const studentAddressSchema = new Schema({
  // Name of street student living
  street: String,

  // Name of city student living
  city: String,

  // Name of province student living
  province: String,

  // Name of postal code student living
  postal_code: String,
});

// *************** MODEL Schema: Student ***************

const studentSchema = new Schema({
  // First name for the student
  first_name: { type: String, required: true },

  // Last name for the student
  last_name: { type: String, required: true },

  // email for the student
  email: { type: String, required: true, unique: true },

  // Civility for the student
  civility: {
    type: String,
    enum: ['Mr', 'Mrs'],
    default: 'Mr',
    required: true,
  },

  // date of birth for the student
  date_of_birth: { type: Date, required: true },

  // Postal code of birth for the student
  postal_code_of_birth: { type: String, required: true },

  // Mobile phone number for student
  mobile_phone: { type: String, maxlength: 12, required: true },

  // Address for the student
  address: [studentAddressSchema],

  // school id the student belongs to
  school_id: { type: Schema.Types.ObjectId, ref: 'School', required: true },

  // Student status
  status: { type: String, enum: ['active', 'delete'], default: 'active' },

  // Student School History
  school_history: [{ type: Schema.Types.ObjectId, ref: 'School' }],

  // Delete at for the student
  deleted_at: { type: Date },
});

// *************** EXPORT MODULE ***************
module.exports = mongoose.model('Student', studentSchema);
