// *************** IMPORT MODULE *************** 
const Student = require('./Student.model.js')
const School = require('../school/school.model.js')
const mongoose = require('mongoose');


// *************** LOGIC *************** 
// *************** Create User
async function createStudent(_, {studentInput}) {
  const schoolId = new mongoose.Types.ObjectId(studentInput.school_id);

  const schoolExist = await School.findById(studentInput.schoolId);
    if (!schoolExist){
      throw new Error ("School not found");
    }
 const studentData = {
    ...studentInput,
    school_id: schoolId
  };
  console.log(typeof studentData.school_id)
  const createdStudent = await Student.create(studentData);
  console.log("Data berhasil disimpan", createdStudent);
  return createdStudent;
}

const studentResolvers = {
  Query: {
    students: () => {
    },
    student: (_, { id }) => {
    }
  },
  Mutation: {
    createStudent
  }
};
// *************** EXPORT MODULE ***************
module.exports = { studentResolvers };