// *************** IMPORT MODULE *************** 
const Student = require('./Student.model.js')
const School = require('../school/school.model.js')
const mongoose = require('mongoose');


// *************** LOGIC *************** 
// *************** Get All student
async function GetAllStudent() {
  return await Student.find({ status : "active"})
}

// *************** Get student By Id
async function GetStudentById(_,{id}) {
  const student = await Student.findById(id)
    if (!student){
      throw new Error("Student Not Found")
    }
    return student;
}

// *************** Create Student
async function CreateStudent(_, {studentInput}) {
  const schoolId = mongoose.Types.ObjectId(studentInput.school_id);

  const schoolExist = await School.findById(schoolId);
    if (!schoolExist){
      throw new Error ("School not found");
    }
 const studentData = {
    ...studentInput,
    school_history: [schoolId],
    school_id: schoolId
  };
  const createdStudent = await Student.create(studentData);
  
  await School.findByIdAndUpdate(schoolId, {
    $push: {student: createdStudent._id}
  });
  console.log("Data berhasil disimpan", createdStudent);
  return createdStudent;
}

// *************** Update Student
async function UpdateStudent(_, { id, studentInput }) {
  if (studentInput.id) {
    throw new Error("Cannot update Student ID");
  }

   const student = await Student.findById(id);
  if (!student) {
    throw new Error("Student not found");
  }

  const newSchoolId = studentInput.school_id;
  const currentSchoolId = student.school_id ? student.school_id.toString() : null;


  if (newSchoolId && newSchoolId !== currentSchoolId) {
    const newSchool = await School.findById(newSchoolId);
    if (!newSchool) throw new Error("New School Not Found");

    const schoolHistorySet = new Set(student.school_history.map(id => id.toString()));
    if (currentSchoolId && !schoolHistorySet.has(currentSchoolId)) {
      schoolHistorySet.add(currentSchoolId);
    }


    studentInput.school_history = Array.from(schoolHistorySet);


    if (currentSchoolId) {
      await School.findByIdAndUpdate(currentSchoolId, {
        $pull: { student: student._id }
      });
    }


    await School.findByIdAndUpdate(newSchoolId, {
      $addToSet: { student: student._id }
    });
  } else {
    studentInput.school_history = student.school_history;
  }

  // Update data student
  const updatedStudent = await Student.findByIdAndUpdate(id, studentInput, { new: true });

  return updatedStudent;
}


// *************** Delete Student
async function DeleteStudent(_,{id}){
    const deleteStudent = await Student.findByIdAndUpdate(
      id,
      {
        status :"deleted",
        deleted_at: new Date()
      },
      {new:true}
    );
    if (!deleteStudent){
      throw new Error("Student Not Found");
    }
    return deleteStudent
}

// *************** Get Current School 
async function GetCurrentSchool(parent){
  return await School.findById(parent.school_id)
}

// *************** Get School History
async function GetSchoolHistory(parent) {
  return await School.find({ _id: { $in: parent.school_history } });
}

const studentResolvers = {
  Query: {
    GetAllStudent,
    GetStudentById
  },
  Mutation: {
    CreateStudent,
    UpdateStudent,
    DeleteStudent
  },
  Student: {
  school: GetCurrentSchool,
  school_history: GetSchoolHistory
}
};
// *************** EXPORT MODULE ***************
module.exports = { studentResolvers };