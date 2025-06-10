// *************** IMPORT MODULE *************** 
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;


// *************** MODEL: User ***************

/**
 * User Schema
 * Describes the structure of the user document in MongoDB.
 */
 const userSchema = new Schema({
    // First name for the user
    first_name : { type:String, required:true },

    // Last name for the user
    last_name : { type:String, required:true },

    // email for the user
    email : { type:String, required:true, unique:true },

    // password for the user
    password : { type:String, required:true },

    // role for the user
    role : { type:String, required:true },

    // Status for the User
    status : { type:String, enum:['active', 'deleted'], default: 'active'},

    // Delete At for the user
    deleted_at : { type:Date, default:null }
})

 
   
// *************** EXPORT MODULE ***************
const User = mongoose.model('User',userSchema);
module.exports = User;
