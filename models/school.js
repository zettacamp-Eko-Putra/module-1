const mongoose = require('mongoose');
const { Schema } = mongoose;

// ********* model schema for school
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

// compile school schema into a model
const School = mongoose.model('School',schoolSchema);

// export model
module.exports = School;