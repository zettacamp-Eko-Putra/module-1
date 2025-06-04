// *************** IMPORT CORE ***************
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// *************** MODEL: User ***************

/**
 * User Schema
 * Describes the structure of the user document in MongoDB.
 */
const userSchema = new Schema({
    // First name for the user
    firstName : { type:String, required:true },

    // Last name for the user
    lastName : { type:String, required:true },

    // email for the user
    email : { type:String, required:true, unique:true },

    // password for the user
    password : { type:String, required:true },

    // role for the user
    role : { type:String, required:true },

    // Delete At for the user
    deletedAt : { type:Date, default:null }
})

// *************** EXPORT MODEL ***************
const User = mongoose.model('User',userSchema);
module.exports = User;