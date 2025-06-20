// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const { Types } = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.models.js');
const SchoolModel = require('../school/school.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateStudentInput } = require('./student.validator.js');
const ValidateIdMongoose = require(`../../utilities/common-validator/mongo-validator.js`);

// *************** QUERY ***************

/**
 * Retrieves all students whose status is set to "active".
 *
 * @async
 * @function GetAllStudents
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of active student objects.
 */
async function GetAllStudents() {
  try {
    // *************** find student data with status active
    const activeStudents = await StudentModel.find({ status: 'active' }).lean();

    // *************** returning student data that has status "active"
    return activeStudents;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a student by their unique ID.
 *
 * @async
 * @function GetStudentById
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the student ID.
 * @param {string} _id - The ID of the student to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the student object.
 * @throws {ApolloError} - Throws an error if the student is not found.
 */
async function GetStudentById(parent, { _id }) {
  try {
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
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new student and links them to a school by ID.
 *
 * Validates the input, checks the existence of the associated school,
 * creates the student record, and updates the school's student list.
 *
 * @async
 * @function CreateStudent
 * @param {object} parent - Unused GraphQL parent resolver argument.
 * @param {object} args - The GraphQL mutation arguments.
 * @param {object} args.student_input - The input object containing student details.
 * @param {string} args.student_input.first_name - Student's first name.
 * @param {string} args.student_input.last_name - Student's last name.
 * @param {string} args.student_input.email - Student's email.
 * @param {string} args.student_input.civility - Civility (e.g., "Mr", "Mrs").
 * @param {string} args.student_input.postal_code_of_birth - Student's birth postal code.
 * @param {string} args.student_input.mobile_phone - Student's mobile phone number.
 * @param {Array<object>} args.student_input.address - Array of address objects.
 * @param {string} [args.student_input.date_of_birth] - Student's date of birth.
 * @param {string} args.student_input.school_id - ID of the school the student is enrolling in.
 *
 * @returns {Promise<object>} - A promise that resolves to the created student object.
 *
 * @throws {ApolloError} - Throws if validation fails or the school ID is not found.
 */
async function CreateStudent(parent, { student_input }) {
  try {
    // *************** validate student_input
    ValidateStudentInput(student_input);

    // *************** find if email already exists
    const isEmailAlreadyExist = await StudentModel.exists({
      email: student_input.email.trim().toLowerCase(),
      status: 'active',
    });

    // *************** showing error message if email already taken
    if (isEmailAlreadyExist) {
      throw new ApolloError('Email already taken');
    }

    // *************** finding school data in database based on id
    const isSchoolExist = await SchoolModel.exists({
      _id: student_input.school_id,
    });

    // *************** showing message if school id cannot be found
    if (!isSchoolExist) {
      throw new ApolloError('School not found');
    }

    // *************** changing student input data and adding it to studentData
    const studentData = {
      first_name: student_input.first_name,
      last_name: student_input.last_name,
      email: student_input.email.trim().toLowerCase(),
      civility: student_input.civility,
      postal_code_of_birth: student_input.postal_code_of_birth,
      mobile_phone: student_input.mobile_phone,
      address: student_input.address,
      date_of_birth: student_input.date_of_birth,
      school_id: student_input.school_id,
      school_history: [student_input.school_id],
    };

    // *************** creating new student based on the studentData
    const createdStudent = await StudentModel.create(studentData);

    // *************** adding student id to school collection
    await SchoolModel.updateOne(
      { _id: student_input.school_id },
      { $push: { students: createdStudent._id } }
    );

    // *************** returning new student data
    return createdStudent;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing student record in the database.
 *
 * Validates the student ID and input, handles school reassignment (if applicable),
 * manages school history updates, and synchronizes student references
 * in related school documents.
 *
 * @async
 * @function UpdateStudent
 * @param {object} parent - Unused GraphQL parent argument.
 * @param {object} args - GraphQL arguments.
 * @param {string} args._id - The ID of the student to update.
 * @param {object} args.student_input - The student input data.
 * @param {string} args.student_input.first_name - First name of the student.
 * @param {string} args.student_input.last_name - Last name of the student.
 * @param {string} args.student_input.email - Email address.
 * @param {string} args.student_input.civility - Civility ("Mr" or "Mrs").
 * @param {string} args.student_input.postal_code_of_birth - Postal code of birth.
 * @param {string} args.student_input.mobile_phone - Mobile phone number.
 * @param {Array<object>} args.student_input.address - List of address objects.
 * @param {string} [args.student_input.date_of_birth] - Date of birth (optional).
 * @param {string} args.student_input.school_id - The new school ID.
 *
 * @returns {Promise<{_id: string}>} - A promise resolving with the ID of the updated student.
 *
 * @throws {ApolloError} - Throws if validation fails, student not found, school not found, or update fails.
 */
async function UpdateStudent(parent, { _id, student_input }) {
  try {
    // *************** Validating student ID and student input
    ValidateIdMongoose(_id);
    ValidateStudentInput(student_input);

    // *************** Find the student by ID
    const student = await StudentModel.findById(_id);

    // ***************showing error message if the student id cannot be found in database
    if (!student) {
      throw new ApolloError('Student not found');
    }

    // *************** take the new school ID from input
    const newSchoolId = student_input.school_id;

    // *************** Get the current school ID from the student data
    const currentSchoolId = student.school_id
      ? String(student.school_id)
      : null;

    // *************** If the school is changing, validate the new school
    if (newSchoolId && newSchoolId !== currentSchoolId) {
      const newSchool = await SchoolModel.findById(newSchoolId)
        .select('_id status')
        .lean();
      if (!newSchool || newSchool.status === 'deleted') {
        throw new ApolloError('New School Not Found or already deleted');
      }
    }

    // *************** taking existing school history
    const schoolHistory = [...(student.school_history || [])];

    // *************** add new school to history if it's different from current
    if (newSchoolId && newSchoolId !== currentSchoolId) {
      schoolHistory.push(newSchoolId);
    }

    // *************** Breakdown student input
    const studentData = {
      first_name: student_input.first_name,
      last_name: student_input.last_name,
      email: student_input.email.trim().toLowerCase(),
      civility: student_input.civility,
      postal_code_of_birth: student_input.postal_code_of_birth,
      mobile_phone: student_input.mobile_phone,
      address: student_input.address,
      date_of_birth: student_input.date_of_birth,
      school_id: newSchoolId,
      school_history: schoolHistory,
    };

    // *************** Update the student in the database and return the updated document
    const updatedStudent = await StudentModel.findByIdAndUpdate(
      _id,
      { $set: studentData },
      { new: true }
    ).lean();

    // ***************  showing error message if the Student update fail
    if (!updatedStudent) {
      throw new ApolloError('Update fail student not found');
    }

    // *************** If school changed, update school references
    if (newSchoolId && newSchoolId !== currentSchoolId) {
      if (currentSchoolId) {
        await SchoolModel.updateOne(
          { _id: currentSchoolId },
          { $pull: { students: student._id } }
        );
      }

      // *************** Add student to new school
      await SchoolModel.updateOne(
        { _id: Types.ObjectId(newSchoolId) },
        { $addToSet: { students: student._id } }
      );
    }

    // *************** returning the updated data
    return updatedStudent;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a student by setting their status to "deleted" and recording a timestamp.
 *
 * Validates the provided student ID, ensures the student is not already deleted,
 * and updates the document. Returns the ID of the deleted student.
 *
 * @async
 * @function DeleteStudent
 * @param {object} parent - Unused GraphQL parent argument.
 * @param {object} args - GraphQL arguments.
 * @param {string} args._id - The ID of the student to delete.
 *
 * @returns {Promise<{_id: string}>} - A promise resolving to an object containing the deleted student's ID.
 *
 * @throws {ApolloError} - Throws if the ID is invalid, student not found, or already deleted.
 */
async function DeleteStudent(parent, { _id }) {
  try {
    // *************** Validating student ID
    ValidateIdMongoose(_id);

    // *************** finding student based on id and update the data
    const deleteStudent = await StudentModel.findByIdAndUpdate(
      { _id },
      {
        // *************** changing status field to deleted and adding timstamp
        status: 'deleted',
        deleted_at: new Date(),
      }
    )
      .select('_id')
      .lean();

    // *************** showing error message if student already deleted
    if (!deleteStudent) {
      throw new ApolloError('Student already deleted');
    }

    // *************** returning student deleted data to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************
/**
 * Retrieves the current school information for a student using DataLoader.
 *
 * Uses the student's `school_id` to load the corresponding school document from the database.
 *
 * @async
 * @function GetCurrentSchool
 * @param {object} parent - The parent object containing the `school_id` field (typically a student).
 * @param {object} args - GraphQL arguments (unused).
 * @param {object} ctx - GraphQL context object containing the DataLoader instance.
 * @param {DataLoader} ctx.school - DataLoader instance for batching and caching school lookups.
 *
 * @returns {Promise<object|null>} - A promise resolving to the school object, or `null` if not found.
 */
async function School(parent, args, ctx) {
  // *************** if there's no school_id, return null
  if (!parent.school_id) {
    return null;
  }

  // *************** using school loaders to mapping school data based on school id
  return await ctx.loaders.school.load(String(parent.school_id));
}

/**
 * Retrieves the school history for a student using DataLoader.
 *
 * Uses the student's `school_history` array to load multiple school documents from the database.
 *
 * @async
 * @function GetSchoolHistory
 * @param {object} parent - The parent object containing the `school_history` field (typically a student).
 * @param {object} args - GraphQL arguments (unused).
 * @param {object} ctx - GraphQL context object containing the DataLoader instance.
 * @param {DataLoader} ctx.school - DataLoader instance for batching and caching school lookups.
 *
 * @returns {Promise<object[]>} - A promise resolving to an array of school objects.
 */
async function SchoolHistory(parent, args, ctx) {
  // *************** if there's no school_id, return null
  if (!parent.school_history) {
    return null;
  }

  // *************** load school data from dataloader
  return await ctx.loaders.school.loadMany(parent.school_history);
}

// *************** EXPORT MODULE ***************
module.exports = {
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
    school: School,
    school_history: SchoolHistory,
  },
};
