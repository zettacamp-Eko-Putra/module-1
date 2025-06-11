// *************** IMPORT MODULE *************** 
const dataLoader = require('dataloader');
const Student = require('./student.models.js');
const keyBy = require('lodash/keyBy');

async function StudentBatch(studentId){
    const students = await Student.find({ 
        _id: { $in:studentId },
        status:'active' });
    const studentMap = keyBy(students, student => student._id.toString());
    return studentId.map(id => studentMap[id.toString()] || null);
}

const CreateStudentLoader = () => {
    return new dataLoader(StudentBatch)
}

module.exports = CreateStudentLoader;