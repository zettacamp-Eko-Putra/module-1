// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { Types } = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.models.js');
const SchoolModel = require('../school/school.models.js');

// *************** IMPORT UTILITIES ***************
const ValidateIdMongoose = require(`../utilities/id_validator.js`);

// *************** IMPORT VALIDATOR ***************
const { ValidateStudentInput } = require('./student.validator.js');

// *************** QUERY ***************

// *************** Get all student function
/**
 * Retrieves all students whose status is set to "active".
 *
 * @async
 * @function GetAllStudent
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of active student objects.
 */
async function GetAllStudents() {
  // *************** find student data with status active
  const activeStudent = await StudentModel.find({ status: 'active' }).lean();

  // *************** returning student data that has status "active"
  return activeStudent;
}

// *************** Get student by id function
/**
 * Retrieves a student by their unique ID.
 *
 * @async
 * @function GetStudentById
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the student ID.
 * @param {string} _id - The ID of the student to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the student object.
 * @throws {Error} - Throws an error if the student is not found.
 */
async function GetStudentById(parent, { _id }) {
  // *************** Validating student ID
  ValidateIdMongoose(_id);

  // *************** finding student based on id
  const student = await StudentModel.findById(_id).lean();

  // *************** showing message if the student cannot be found
  if (!student) {
    throw new ApolloError('Student Not Found');
  }

  // *************** returning student data if student in database
  return student;
}

// *************** MUTATION ***************

// *************** Create student function
/**
 * Creates a new student and associates them with a school.
 *
 * @async
 * @function CreateStudent
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing student input data.
 * @param {object} student_input - Input data for the new student.
 * @param {string} student_input.school_id - The ID of the school to associate with the student.
 * @returns {Promise<object>} - A promise that resolves to the newly created student object.
 * @throws {Error} - Throws an error if the school is not found.
 */
async function CreateStudent(parent, { student_input }) {
  // *************** validate student_input
  ValidateStudentInput(student_input);

  // *************** changing input school_id to object type
  const schoolId = mongoose.Types.ObjectId(student_input.school_id);

  // *************** finding school data in database based on id
  const isSchoolExist = await SchoolModel.exists({
    _id: schoolId,
  });

  // *************** showing message if school id cannot be found
  if (!isSchoolExist) {
    throw new ApolloError('School not found');
  }

  // *************** changing student input data and adding it to studentData
  const studentData = {
    first_name: student_input.first_name,
    last_name: student_input.last_name,
    email: student_input.email,
    civility: student_input.civility,
    postal_code_of_birth: student_input.postal_code_of_birth,
    mobile_phone: student_input.mobile_phone,
    address: student_input.address,
    date_of_birth: student_input.date_of_birth,
    school_id: schoolId,
    school_history: [schoolId],
  };

  // *************** creating new student based on the studentData
  const createdStudent = await StudentModel.create(studentData);

  // *************** adding student id to school collection
  await SchoolModel.updateOne(
    { _id: schoolId },
    { $push: { student: createdStudent._id } }
  );

  // *************** returning new student data
  return createdStudent;
}

// *************** Update student function
/**
 * Updates an existing student's information, including handling changes to their associated school.
 *
 * @async
 * @function UpdateStudent
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the student ID and input data.
 * @param {string} _id - The ID of the student to update.
 * @param {object} student_input - The updated student data.
 * @param {string} [student_input.school_id] - The ID of the new school, if changed.
 * @returns {Promise<object>} - A promise that resolves to the updated student object.
 * @throws {Error} - Throws an error if attempting to update student ID or if student/school not found.
 */
async function UpdateStudent(parent, { _id, student_input }) {
  // ***************showing error message if the student tried to update their id
  if (student_input._id) {
    throw new ApolloError('Cannot update Student ID');
  }

  // *************** Validating student ID
  await ValidateIdMongoose(_id);

  // *************** validate student_input
  await ValidateStudentInput(student_input);

  // *************** find user by id and adding it to student variable
  const student = await StudentModel.findById(_id);

  // ***************showing error message if the student id cannot be found in database
  if (!student) {
    throw new ApolloError('Student not found');
  }

  // *************** taking StudentInput and add it to newSchoolId variable
  const newSchoolId = student_input.school_id;

  // *************** taking current student id
  const currentSchoolId = student.school_id ? String(student.school_id) : null;

  // *************** creating if to check if the current school id is different with new school id input
  if (newSchoolId && newSchoolId !== currentSchoolId) {
    // *************** finding new school id in the database
    const newSchool = await SchoolModel.findById(newSchoolId);

    // *************** showing error message if the new school id cannot be found or already deleted
    if (!newSchool || newSchool.status === `deleted`)
      throw new Error('New School Not Found or already deleted');

    // *************** creating set to avoid duplicate data
    const schoolHistorySet = new Set(
      (student.school_history || []).map((id) => String(id))
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
      await SchoolModel.updateOne(
        // *************** pull student data form old school
        { _id: currentSchoolId },
        { $pull: { students: student._id } }
      );
    }

    // *************** finding data of the new school
    await SchoolModel.updateOne(
      // *************** pushing student data to new school
      { _id: Types.ObjectId(newSchoolId) },
      { $addToSet: { students: student._id } }
    );
  } else {
    // *************** if there's no change use the old school_history data
    student_input.school_history = student.school_history;
  }

  // *************** Breakdown student input
  const studentData = {
    first_name: student_input.first_name,
    last_name: student_input.last_name,
    email: student_input.email,
    civility: student_input.civility,
    postal_code_of_birth: student_input.postal_code_of_birth,
    mobile_phone: student_input.mobile_phone,
    address: student_input.address,
    date_of_birth: student_input.date_of_birth,
    school_id: newSchoolId,
    school_history: student_input.school_history,
  };
  // *************** updating the student data and save it to database
  const updatedStudent = await StudentModel.findByIdAndUpdate(
    _id,
    { $set: studentData },
    { new: true }
  );

  // *************** returning the updated data
  return updatedStudent;
}

// *************** Delete student function
/**
 * Soft deletes a student by setting their status to "deleted" and recording the deletion timestamp.
 *
 * @async
 * @function DeleteStudent
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the student ID.
 * @param {string} _id - The ID of the student to delete.
 * @returns {Promise<object>} - A promise that resolves to the soft-deleted student object.
 * @throws {Error} - Throws an error if the student is not found.
 */
async function DeleteStudent(parent, { _id }) {
  // *************** Validating student ID
  await ValidateIdMongoose(_id);

  // *************** finding student based on id and update the data
  const deleteStudent = await StudentModel.findOneAndUpdate(
    { _id, status: { $ne: `deleted` } },
    {
      // *************** changing status field to deleted and adding timstamp
      status: 'deleted',
      deleted_at: new Date(),
    }
  );

  // *************** showing error message if student already deleted
  if (!deleteStudent) {
    throw new ApolloError('Student already deleted');
  }

  // *************** returning student deleted data to user
  return deleteStudent;
}

// *************** LOADER ***************

// *************** Get current school using loader function
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
async function GetCurrentSchool(parent, args, ctx) {
  // *************** adding loaders to ctx
  const { loaders } = ctx;

  // *************** using school loaders to mapping school data based on school id
  const result = await loaders.school.load(String(parent.school_id));

  return result;
}

// *************** Get school history using loader function
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
async function GetSchoolHistory(parent, args, ctx) {
  // *************** adding loaders to ctx
  const { loaders } = ctx;

  // *************** load school data from dataloader
  const result = await loaders.school.loadMany(parent.school_history);

  // *************** returning school data
  return result;
}

const studentResolvers = {
  Query: {
    GetAllStudents,
    GetStudentById,
  },
  Mutation: {
    CreateStudent,
    UpdateStudent,
    DeleteStudent,
  },
  Student: {
    school: GetCurrentSchool,
    school_history: GetSchoolHistory,
  },
};
// *************** EXPORT MODULE ***************
module.exports = studentResolvers;
