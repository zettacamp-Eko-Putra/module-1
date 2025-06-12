// *************** IMPORT MODULE *************** 
const Student = require('./student.models.js')
const School = require('../school/school.models.js')
const mongoose = require('mongoose');


// *************** LOGIC *************** 
/**
 * Retrieves all students whose status is set to "active".
 *
 * @async
 * @function GetAllStudent
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of active student objects.
 */
async function GetAllStudent() {
   // *************** find student data with status active
  const activeStudent = await Student.find({ status : "active"});

  // *************** returning student data that has status "active"
  return activeStudent;
}

/**
 * Retrieves a student by their unique ID.
 *
 * @async
 * @function GetStudentById
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the student ID.
 * @param {string} args.id - The ID of the student to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the student object.
 * @throws {Error} - Throws an error if the student is not found.
 */
async function GetStudentById(parent,{_id}) {

   // *************** finding student based on id
  const student = await Student.findById(_id)

   // *************** creating if to showing message if the student cannot be found
    if (!student){

      // *************** error message if the student cannot be found in database
      throw new Error("Student Not Found")
    }

    // *************** returning student data if student in database
    return student;
}

/**
 * Creates a new student and associates them with a school.
 *
 * @async
 * @function CreateStudent
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing student input data.
 * @param {object} args.studentInput - Input data for the new student.
 * @param {string} args.studentInput.school_id - The ID of the school to associate with the student.
 * @returns {Promise<object>} - A promise that resolves to the newly created student object.
 * @throws {Error} - Throws an error if the school is not found.
 */
async function CreateStudent(parent, {student_input}) 
{

  // *************** changing input school_id to object type
  const schoolId = mongoose.Types.ObjectId(student_input.school_id);

  // *************** finding school data in database based on id
  const schoolExist = await School.findById(schoolId);

  // *************** creating if to showing message if school id cannot be found
    if (!schoolExist){

      // *************** error message if the school id cannot be found in database
      throw new Error ("School not found");
    }

    // *************** changing student input data and adding it to studentData
 const studentData = {

    // *************** all student input data
    ...student_input,

    // *************** adding school history array with schoolId
    school_history: [schoolId],

    // *************** adding school_id with schoolId
    school_id: schoolId
  };

  // *************** creating new student based on the studentData
  const createdStudent = await Student.create(studentData);
  

  // *************** adding student id to school collection
  await School.findByIdAndUpdate(schoolId, {
    $push: {student: createdStudent._id}
  });

  // *************** returning new student data
  return createdStudent;
}

/**
 * Updates an existing student's information, including handling changes to their associated school.
 *
 * @async
 * @function UpdateStudent
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the student ID and input data.
 * @param {string} args.id - The ID of the student to update.
 * @param {object} args.studentInput - The updated student data.
 * @param {string} [args.studentInput.school_id] - The ID of the new school, if changed.
 * @returns {Promise<object>} - A promise that resolves to the updated student object.
 * @throws {Error} - Throws an error if attempting to update student ID or if student/school not found.
 */
async function UpdateStudent(parent, { _id, student_input }) {

  // *************** creating if to showing error message if the student tried to update their id
  if (student_input._id) {

        // *************** error message if user tried to update their id
    throw new Error("Cannot update Student ID");
  }

  // *************** find user by id and adding it to student variable
   const student = await Student.findById(_id);

   // *************** creating if to showing error message if the student id cannot be found in database
  if (!student) {

    // *************** message if student id cannot be found in database
    throw new Error("Student not found");
  }

  // *************** taking StudentInput and add it to newSchoolId variable
  const newSchoolId = student_input.school_id;

  // *************** taking current student id
  const currentSchoolId = student.school_id ? student.school_id.toString() : null;


  // *************** creating if to check if the current school id is different with new school id input
  if (newSchoolId && newSchoolId !== currentSchoolId) {

    // *************** finding new school id in the database
    const newSchool = await School.findById(newSchoolId);

    // *************** showing error message if the new school id cannot be found
    if (!newSchool) throw new Error("New School Not Found");

  // *************** creating set to avoid duplicate data
    const schoolHistorySet = new Set(
      (student.school_history || []).map(id => id.toString())
    );

    // *************** creating if to check if the new school data already in school_history 
      if (!schoolHistorySet.has(newSchoolId)) {
      schoolHistorySet.add(newSchoolId);
    }

    // *************** update school history with the new school history
    student_input.school_history = Array.from(schoolHistorySet);

    // *************** creating if to update data form old school
    if (currentSchoolId) {

      // *************** finding old school data based on database
      await School.findByIdAndUpdate(currentSchoolId, {

        // *************** pull student data form old school
        $pull: { student: student._id }
      });
    }

    // *************** finding data of the new school
    await School.findByIdAndUpdate(newSchoolId, {

      // *************** pushing student data to new school
      $addToSet: { student: student._id }
    });
  } else {

    // *************** if there's no change use the old school_history data
    studentInput.school_history = student.school_history;
  }

  // *************** updating the student data and save it to database
  const updatedStudent = await Student.findByIdAndUpdate(_id, student_input, { new: true });

  // *************** returning the updated data
  return updatedStudent;
}


/**
 * Soft deletes a student by setting their status to "deleted" and recording the deletion timestamp.
 *
 * @async
 * @function DeleteStudent
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the student ID.
 * @param {string} args.id - The ID of the student to delete.
 * @returns {Promise<object>} - A promise that resolves to the soft-deleted student object.
 * @throws {Error} - Throws an error if the student is not found.
 */
async function DeleteStudent(parent,{_id}){
    const deleteStudent = await Student.findByIdAndUpdate(
      _id,
      {
        // *************** changing status field to deleted
        status :"deleted",

        // *************** adding timestamp to deleted_at field
        deleted_at: new Date()
      },

      // *************** overwrite the old data with new one
      {new:true}
    );

    // *************** creating if to showing error message if student id cannot be found in database
    if (!deleteStudent){

       // *************** message if the student id cannot be found in database
      throw new Error("Student Not Found");
    }

    // *************** returning student deleted data to user
    return deleteStudent
}

/**
 * Retrieves the current school information for a student using DataLoader.
 *
 * @async
 * @function GetCurrentSchool
 * @param {object} parent - The parent object containing the school ID (typically a student object).
 * @param {any} _ - Unused argument placeholder.
 * @param {object} context - The GraphQL context containing the loaders.
 * @param {object} context.loaders - Object containing DataLoader instances.
 * @param {DataLoader<string, object>} context.loaders.school - DataLoader instance for loading school data by ID.
 * @returns {Promise<object>} - A promise that resolves to the school object associated with the student.
 */
async function GetCurrentSchool(parent,args,{loaders}){

  // *************** using school loaders to mapping school data based on school id
  const result = await loaders.school.load(parent.school_id.toString());

  return result;
}

/**
 * Retrieves the full school history for a student using DataLoader.
 *
 * @async
 * @function GetSchoolHistory
 * @param {object} parent - The parent object containing the school history array (usually a student object).
 * @param {any} _ - Unused GraphQL argument placeholder.
 * @param {object} context - The GraphQL context containing DataLoader instances.
 * @param {object} context.loaders - Object containing DataLoader instances.
 * @param {DataLoader<string, object>} context.loaders.school - DataLoader instance for loading school data by ID.
 * @returns {Promise<object[]>} - A promise that resolves to an array of school objects from the student's history.
 */
async function GetSchoolHistory(parent,args,{loaders}) {

    // *************** using school loaders to mapping school data based on school id
  const ids = parent.school_history.map(id => id.toString());

  // *************** load school data from dataloader
  const result = await loaders.school.loadMany(ids);

  // *************** returning school data
  return result;
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