// *************** IMPORT MODULE ***************
const School = require("./school.models.js");
const Student = require("../student/student.models.js");

/**
 * Retrieves all school documents with status set to "active".
 *
 * @async
 * @function GetAllSchool
 * @returns {Promise<object[]>} - A promise that resolves to an array of active school objects.
 */
async function GetAllSchool() {
  // *************** find school data with status active
  const activeSchool = await School.find({ status: "active" });

  // *************** returning school data with status active
  return activeSchool;
}

/**
 * Retrieves a school by its unique ID.
 *
 * @async
 * @function GetSchoolById
 * @param {object} _ - Unused parent argument.
 * @param {object} args - The arguments object.
 * @param {string} args.id - The ID of the school to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the school object.
 * @throws {Error} - Throws an error if the school is not found.
 */
async function GetSchoolById(parent, { _id }) {
  // *************** finding school based on id
  const school = await School.findById(_id);

  // *************** creating if to showing message if the school cannot be found
  if (!school) {
    // *************** error message if the user cannot be found in database
    throw new Error("School not found");
  }

  // *************** returning user data if user in database
  return school;
}

/**
 * Creates a new school if the name is not already taken.
 *
 * @async
 * @function CreateSchool
 * @param {object} _ - Unused parent argument.
 * @param {object} args - The arguments object.
 * @param {object} args.schoolInput - The input object containing school data.
 * @param {string} args.schoolInput.name - The name of the school.
 * @returns {Promise<object>} - A promise that resolves to the newly created school object.
 * @throws {Error} - Throws an error if a school with the same name already exists.
 */
async function CreateSchool(parent, { school_input }) {
  // *************** validate school_input
  ValidateSchoolInput(school_input);

  // *************** check if the school name already taken by another school
  const schoolTaken = await School.findOne({
    school_legal_name: school_input.school_legal_name,
  });

  // *************** creating if to showing message if the name already taken by another school
  if (schoolTaken) {
    // *************** error message if the name already taken
    throw new Error("School name already exists");
  }

  // *************** creating new school based on the schoolInput
  const createdSchool = await School.create(school_input);

  // *************** returning new school data
  return createdSchool;
}

/**
 * Updates an existing school by ID with the provided input data.
 *
 * @async
 * @function UpdateSchool
 * @param {object} _ - Unused parent argument.
 * @param {object} args - The arguments object.
 * @param {string} args.id - The ID of the school to be updated.
 * @param {object} args.schoolInput - The input object containing updated school data.
 * @returns {Promise<object>} - A promise that resolves to the updated school object.
 * @throws {Error} - Throws an error if the school ID is attempted to be updated or if the school is not found.
 */
async function UpdateSchool(parent, { _id, school_input }) {
  // *************** validate school_input
  ValidateSchoolInput(school_input);

  // *************** creating if to showing error message if the school tried to update their id
  if (school_input._id) {
    // *************** error message if school tried to update their id
    throw new Error("Cannot update School ID");
  }

  // *************** finding school based on id and overwrite it with new data and saving it to database
  const updatedSchool = await School.findByIdAndUpdate(_id, school_input, {
    new: true,
  });

  // *************** creating if to showing error message if the school id cannot be found in database
  if (!updatedSchool) {
    // *************** message if school id cannot be found in database
    throw new Error("School not Found");
  }

  // *************** returning school updated data to user
  return updatedSchool;
}

/**
 * Soft deletes a school by setting its status to "deleted" and recording the deletion timestamp.
 *
 * @async
 * @function DeleteSchool
 * @param {object} _ - Unused parent argument.
 * @param {object} args - The arguments object.
 * @param {string} args.id - The ID of the school to be soft-deleted.
 * @returns {Promise<object>} - A promise that resolves to the soft-deleted school object.
 * @throws {Error} - Throws an error if the school is not found.
 */
async function DeleteSchool(parent, { _id }) {
  // *************** finding school based on id and update the data
  const deleteSchool = await School.findByIdAndUpdate(
    _id,
    {
      // *************** changing status field to deleted
      status: "deleted",

      // *************** adding timestamp to deleted_at field
      deleted_at: new Date(),
    },

    // *************** overwrite the old data with new one
    { new: true }
  );

  // *************** creating if to showing error message if school id cannot be found in database
  if (!deleteSchool) {
    // *************** message if the user id cannot be found in database
    throw new Error("School not found");
  }

  // *************** returning school deleted data to user
  return deleteSchool;
}

/**
 * Retrieves student data associated with a school using DataLoader.
 *
 * @async
 * @function GetStudentData
 * @param {object} parent - The parent object, expected to be a school document.
 * @param {object} _ - Unused GraphQL argument.
 * @param {object} context - The GraphQL context object.
 * @param {object} context.loaders - DataLoader object from context.
 * @returns {Promise<Array>} - An array of student documents.
 */
async function GetStudentData(parent, args, ctx) {
  const { loaders } = ctx;

  // *************** creating if to check if the school student array empty
  if (!parent.student || parent.student.length === 0) {
    // *************** retuning value if student array empty
    return [];
  }

  // *************** using student loaders to mapping student data based on student id
  const studentId = parent.student.map((id) => id.toString());

  // *************** taking student data using data loader
  const result = await loaders.student.loadMany(studentId);

  const filterResult = result.filter((student) => student !== null);

  // *************** retuning the result and filter it not to showing null value
  return filterResult;
}

const schoolResolvers = {
  Query: {
    GetAllSchool,
    GetSchoolById,
  },
  Mutation: {
    CreateSchool,
    UpdateSchool,
    DeleteSchool,
  },
  School: {
    students: GetStudentData,
  },
};

// *************** EXPORT MODULE ***************
module.exports = { schoolResolvers };
