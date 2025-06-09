// *************** IMPORT MODULE *************** 
const mongoose = require('mongoose');
const { Schema } = mongoose;


// *************** MODEL: Student ***************

/**
 * Student Schema
 * Describes the structure of the student document in MongoDB.
 */
const studentSchema = new Schema({

    // First name for the student
    first_name : { type:String, required: true },

    // Last name for the student
    last_name : { type:String, required: true },

    // email for the student
    email : { type:String, required: true, unique:true },

    // date of birth for the student
    date_of_birth : { type:Date },

    // school id the student belongs to
    school_id: { type : Schema.Types.ObjectId, ref:'School', required: true },


    // Student status
    status: { type :String, enum:["active","delete"], default:"active"},

    // Delete at for the student
    deleted_at : { type:Date, default:null}
})

// *************** EXPORT MODULE ***************
const Student = mongoose.model('Student',studentSchema);
module.exports = Student;