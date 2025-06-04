// *************** IMPORT CORE ***************
const mongoose = require('mongoose');
const { Schema } = mongoose;

// *************** MODEL: School ***************

/**
 * School Schema
 * Describes the structure of the School document in MongoDB.
 */
const schoolSchema = new Schema({

    // name for the school
    name : { type:String, required: true },

    // address for the school
    address : { type:String, required: true },

    // Student for the school
    student : { type:Schema.Types.ObjectId, ref:'Student' },

    // delete at for the school
    deletedAt : { type:Date, default:null }
})

// *************** EXPORT MODEL ***************
const School = mongoose.model('School',schoolSchema);
module.exports = School;