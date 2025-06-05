// *************** IMPORT CORE ***************
const mongoose = require('mongoose');
const { Schema } = mongoose;


// *************** MODEL: Student ***************

/**
 * Student Schema
 * Describes the structure of the student document in MongoDB.
 */
const studentSchema = new Schema({

    // First name for the student
    firstName : { type:String, required: true },

    // Last name for the student
    lastName : { type:String, required: true },

    // email for the student
    email : { type:String, required: true, unique:true },

    // date of birth for the user
    dateOfBirth : { type:Date },

    // school id the user belongs to
    schoolID : { type : Schema.Types.ObjectId, ref:'School', required: true },

    // Delete at for the student
    deletedAt : { type:Date, default:null}
})

// *************** EXPORT MODEL ***************
const Student = mongoose.model('Student',studentSchema);
module.exports = Student;