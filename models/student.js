const mongoose = require('mongoose');
const { Schema } = mongoose;


// ********* model schema for student
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
    schoolID : { type : Schema.Types.ObjectId, ref:'school', required: true },

    // Delete at for the stundent
    deletedAt : { type:Date, default:null}
})

// compile student schema into a model
const Student = mongoose.model('Student',studentSchema);

// export model
module.exports = Student;