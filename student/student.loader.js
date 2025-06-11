// *************** IMPORT MODULE *************** 
const dataLoader = require('dataloader');
const Student = require('./student.models.js');
const keyBy = require('lodash/keyBy');

// *************** Batch Student Data
async function StudentBatch(studentId){
    const students = await Student.find({ 
        _id: { $in:studentId },
        status:'active' });
    const studentMap = keyBy(students, student => student._id.toString());
    return studentId.map(id => studentMap[id.toString()] || null);
}

// *************** Adding Loader
const CreateStudentLoader = () => {
    return new dataLoader(StudentBatch)
}

// *************** EXPORT MODULE *************** 
module.exports = CreateStudentLoader;