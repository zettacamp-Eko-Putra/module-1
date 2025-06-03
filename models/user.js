const mongoose = require('mongoose');
const { Schema } = mongoose;

// ********* model schema for user
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
    deletedAt : { type:Date, defaul:null }
})

// compile user schema 
const User = mongoose.model('User',userSchema);