// *************** IMPORT MODULE *************** 
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;


// *************** MODEL: User ***************
// *************** MODEL Schema: User Address ***************
const userAddressSchema = new Schema({
    // Name of street user living
    street: String,

     // Name of city user living
    city: String,

     // Name of province user living
    province: String,

     // Number of postal code user living
    postal_code: String
})

// *************** MODEL Schema: User ***************
 const userSchema = new Schema({
    // First name for the user
    first_name : { type:String, required:true },

    // Last name for the user
    last_name : { type:String, required:true },

    // Civility for the user
    civility : { type:String, enum:['Mr','Mrs'], default: 'Mr', required:true },

    // office_phone for the user
    office_phone : { type:String, maxlength: 12 },

    // direct line for the user
    direct_line : { type:String, maxlength: 12 },

    // Mobile phone for the user
    mobile_phone : { type:String, maxlength: 12, required:true },

    // Entity the user belong to
    entity : { type:String, enum:['ADMTC','Academic','Company'], required:true },

    // User Address
    address: [userAddressSchema],

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
