// *************** IMPORT MODULE *************** 
const dataLoader = require('dataloader');
const Student = require('./student.models');
const keyBy = require('lodash');

async function StudentBatch(studentId){
    const students = await Student.find({
        _id: {
            $in:studentId
        }
    });
    const studentById = keyBy(students, '_id');
    return studentId.map(studentId => studentById[studentId])
}

const studentLoader = () => {
    return new dataLoader(StudentBatch)
}

module.exports = studentLoader;