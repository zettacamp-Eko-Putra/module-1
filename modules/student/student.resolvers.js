// *************** IMPORT LIBRARY ***************
const { Types } = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const StudentModel = require('./student.models.js');
const SchoolModel = require('../school/school.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateStudentInput } = require('./student.validator.js');
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

// *************** QUERY ***************
/**
 * Retrieves all students whose status is set to "active".
 *
 * @async
 * @function GetAllStudents
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of active student objects.
 */
async function GetAllStudents(_, args) {
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
 * @function GetOneStudent
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the student ID.
 * @param {string} _id - The ID of the student to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the student object.
 * @throws {ApolloError} - Throws an error if the student is not found.
 */
async function GetOneStudent(_, { _id }) {
  try {
    // *************** Validating student ID
    ValidateIdMongoose(_id, 'GetOneStudent');

    // *************** finding student based on id and status active
    const student = await StudentModel.findOne({
      _id,
      status: 'active',
    }).lean();

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
 * Creates a new student record in the database.
 *
 * This function validates the input, checks for existing email and valid school ID,
 * then creates a new student, updates the associated school's student list,
 * and returns the created student data.
 *
 * @async
 * @function CreateStudent
 * @param {object} parent - GraphQL parent resolver (unused).
 * @param {object} args - The arguments object.
 * @param {object} args.student_input - Input object containing student information.
 * @param {string} args.student_input.first_name - Student's first name.
 * @param {string} args.student_input.last_name - Student's last name.
 * @param {string} args.student_input.email - Student's email.
 * @param {string} args.student_input.civility - Student's civility ("Mr" or "Mrs").
 * @param {string} args.student_input.postal_code_of_birth - Postal code of the student's birth.
 * @param {string} args.student_input.mobile_phone - Student's mobile phone number.
 * @param {Array<object>} args.student_input.address - List of student's address objects.
 * @param {string|Date} [args.student_input.date_of_birth] - Optional date of birth.
 * @param {string} args.student_input.school_id - The ID of the school the student is enrolled in.
 *
 * @returns {Promise<object>} - A promise that resolves to the newly created student object.
 *
 * @throws {ApolloError} - Throws if validation fails, the email is already taken, or the school ID is invalid.
 */
async function CreateStudent(_, { student_input }) {
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
 * Updates an existing student with the provided input.
 *
 * This function validates the student ID and input data, checks for school changes,
 * updates school history, manages school-student references, and updates the student record in the database.
 *
 * @async
 * @function UpdateStudent
 * @param {object} parent - GraphQL parent resolver (unused).
 * @param {object} args - The arguments object.
 * @param {string} args._id - The ID of the student to update.
 * @param {object} args.student_input - The new data to update the student with.
 * @param {string} args.student_input.first_name - Student's first name.
 * @param {string} args.student_input.last_name - Student's last name.
 * @param {string} args.student_input.email - Student's email.
 * @param {string} args.student_input.civility - Student's civility ("Mr" or "Mrs").
 * @param {string} args.student_input.postal_code_of_birth - Student's postal code of birth.
 * @param {string} args.student_input.mobile_phone - Student's mobile phone.
 * @param {Array<object>} args.student_input.address - List of student addresses.
 * @param {string|Date} [args.student_input.date_of_birth] - Student's date of birth.
 * @param {string} args.student_input.school_id - ID of the student's current school.
 *
 * @returns {Promise<object>} - A promise that resolves to the updated student object.
 *
 * @throws {ApolloError} - Throws if the student ID or school ID is invalid, or if any validation or database update fails.
 */
async function UpdateStudent(_, { _id, student_input }) {
  try {
    // *************** Validating student ID and student input
    ValidateIdMongoose(_id, 'UpdateStudent');
    ValidateStudentInput(student_input);

    // *************** Find the student data
    const student = await StudentModel.findOne({
      _id,
      status: 'active',
    }).lean();

    // *************** showing error message if the student id cannot be found in database
    if (!student) {
      throw new ApolloError('Student not found');
    }

    // *************** Take email student input
    const emailInput = student_input.email.trim().toLowerCase();

    // *************** Take current student email
    const currentEmail = student.email;

    // *************** check if there same email in database
    if (emailInput !== currentEmail) {
      const isEmailAlreadyExist = await StudentModel.exists({
        email: emailInput,
        status: 'active',
        _id: { $ne: _id },
      });
      // *************** Throw error if there same email in database
      if (isEmailAlreadyExist) {
        throw new ApolloError('Email already exists');
      }
    }

    // *************** take the new school ID from input
    const newSchoolId = student_input.school_id;

    // *************** Get the current school ID from the student data
    const currentSchoolId = student.school_id
      ? String(student.school_id)
      : null;

    // *************** taking existing school history
    const schoolHistory = [...(student.school_history || [])];

    // *************** If the school is changing, validate the new school
    if (newSchoolId && newSchoolId !== currentSchoolId) {
      const newSchool = await SchoolModel.findById(newSchoolId)
        .select('_id status')
        .lean();
      if (!newSchool || newSchool.status === 'deleted') {
        throw new ApolloError('New School Not Found or already deleted');
      }
      // *************** add new school to history if it's different from current
      schoolHistory.push(currentSchoolId);

      // *************** Pull student from old school
      await SchoolModel.updateOne(
        { _id: currentSchoolId },
        { $pull: { students: student._id } }
      );

      // *************** Add student to new school
      await SchoolModel.updateOne(
        { _id: Types.ObjectId(newSchoolId) },
        { $addToSet: { students: student._id } }
      );
    }

    // *************** Breakdown student input
    const studentData = {
      first_name: student_input.first_name,
      last_name: student_input.last_name,
      email: emailInput,
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

    // *************** returning the updated data
    return updatedStudent;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a student by setting their status to "deleted" and recording a deletion timestamp.
 *
 * This function validates the provided student ID, attempts to mark the student as deleted,
 * and returns the ID of the deleted student. If the student does not exist or is already deleted,
 * an error is thrown.
 *
 * @async
 * @function DeleteStudent
 * @param {object} parent - GraphQL parent resolver (unused).
 * @param {object} args - The arguments object.
 * @param {string} args._id - The ID of the student to delete.
 *
 * @returns {Promise<string>} - A promise that resolves to the ID of the deleted student.
 *
 * @throws {ApolloError} - Throws if the ID is invalid or the student is not found.
 */
async function DeleteStudent(_, { _id }) {
  try {
    // *************** Validating student ID
    ValidateIdMongoose(_id, 'DeleteStudent');

    // *************** finding student based on id and status and update the data
    const deleteStudent = await StudentModel.findOneAndUpdate(
      { _id, status: { $ne: 'deleted' } },
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
 * @function school
 * @param {object} parent - The parent object containing the `school_id` field (typically a student).
 * @param {object} args - GraphQL arguments (unused).
 * @param {object} ctx - GraphQL context object containing the DataLoader instance.
 * @param {DataLoader} ctx.school - DataLoader instance for batching and caching school lookups.
 *
 * @returns {Promise<object|null>} - A promise resolving to the school object, or `null` if not found.
 */
async function school_id(parent, _, ctx) {
  // *************** if there's no school_id, return null
  if (!parent.school_id) {
    return null;
  }

  // *************** using school loaders to mapping school data based on school id
  return await ctx.loaders.SchoolLoader.load(String(parent.school_id));
}

/**
 * Retrieves the school history for a student using DataLoader.
 *
 * Uses the student's `school_history` array to load multiple school documents from the database.
 *
 * @async
 * @function school_history
 * @param {object} parent - The parent object containing the `school_history` field (typically a student).
 * @param {object} args - GraphQL arguments (unused).
 * @param {object} ctx - GraphQL context object containing the DataLoader instance.
 * @param {DataLoader} ctx.school - DataLoader instance for batching and caching school lookups.
 *
 * @returns {Promise<object[]>} - A promise resolving to an array of school objects.
 */
async function school_history(parent, _, ctx) {
  // *************** if there's no school_id, return null
  if (!parent.school_history) {
    return null;
  }

  // *************** load school data from dataloader
  return await ctx.loaders.SchoolLoader.loadMany(parent.school_history);
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllStudents,
    GetOneStudent,
  },
  Mutation: {
    CreateStudent,
    UpdateStudent,
    DeleteStudent,
  },
  Student: {
    school: school_id,
    school_history: school_history,
  },
};
