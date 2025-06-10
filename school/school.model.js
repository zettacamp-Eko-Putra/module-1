// *************** IMPORT MODULE *************** 
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// *************** MODEL: School ***************

/**
 * School Schema
 * Describes the structure of the School document in MongoDB.
 */
const addressSchema = new Schema({
    street: String,
    city: String,
    province: String,
    postal_code: String
})

const schoolSchema = new Schema({

    // name for the school
    name : { type:String, required: true },

    // address for the school
    address : [ addressSchema ],

    // Student for the school
    student : [{ type:Schema.Types.ObjectId, ref:'Student' }],

    // School status
    status : { type:String, enum:['active','delete'], default:'active'},

    // delete at for the school
    deleted_at : { type:Date, default:null }
})

// *************** EXPORT MODULE ***************
const School = mongoose.model('School',schoolSchema,'school');
module.exports = School;