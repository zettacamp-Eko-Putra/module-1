// *************** IMPORT MODULE ***************
const SchoolModel = require("./school.models.js");

// *************** IMPORT VALIDATOR ***************
const { ValidateSchoolInput } = require("./school.validator.js");

/**
 * Retrieves all school documents with status set to "active".
 *
 * @async
 * @function GetAllSchools
 * @returns {Promise<object[]>} - A promise that resolves to an array of active school objects.
 */
async function GetAllSchools() {
  // *************** find school data with status active
  const activeSchool = await SchoolModel.find({ status: "active" }).lean();

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
 * @param {string} _id - The ID of the school to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the school object.
 * @throws {Error} - Throws an error if the school is not found.
 */
async function GetSchoolById(parent, { _id }) {
  // *************** finding school based on id
  const school = await SchoolModel.findById(_id).lean();

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
 * @param {object} school_input - The input object containing school data.
 * @param {string} school_input.name - The name of the school.
 * @returns {Promise<object>} - A promise that resolves to the newly created school object.
 * @throws {Error} - Throws an error if a school with the same name already exists.
 */
async function CreateSchool(parent, { school_input }) {
  // *************** validate school_input
  ValidateSchoolInput(school_input);

  // *************** check if the school name already taken by another school
  const isSchoolNameAlreadyExist = await SchoolModel.exists({
    status: "active",
    school_legal_name: {
      $regex: `^${school_input.school_legal_name.trim()}$`,
      $options: "i",
    },
  });

  // *************** showing error message if the name already taken by another school
  if (isSchoolNameAlreadyExist) {
    throw new Error("School name already exists");
  }

  // *************** creating new school based on the schoolInput
  const createdSchool = await SchoolModel.create(school_input);

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
 * @param {string} _id - The ID of the school to be updated.
 * @param {object} school_input - The input object containing updated school data.
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
  const updatedSchool = await SchoolModel.findByIdAndUpdate(_id, school_input, {
    new: true,
  });

  // ***************  showing error message if the school id cannot be found in database
  if (!updatedSchool) {
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
 * @param {string} _id - The ID of the school to be soft-deleted.
 * @returns {Promise<object>} - A promise that resolves to the soft-deleted school object.
 * @throws {Error} - Throws an error if the school is not found.
 */
async function DeleteSchool(parent, { _id }) {
  // *************** finding school based on id and update the data
  const deleteSchool = await SchoolModel.findByIdAndUpdate(
    _id,
    {
      // *************** changing status field to deleted and adding timestamp
      status: "deleted",
      deleted_at: new Date(),
    },

    // *************** Update the Data
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
  // *************** adding loaders to ctx
  const { loaders } = ctx;

  // *************** creating if to check if the school student array empty
  if (!parent.student || parent.student.length === 0) {
    // *************** retuning value if student array empty
    return [];
  }

  // *************** taking student data using data loader
  const result = await loaders.student.loadMany(parent.student);

  const filterResult = result.filter((student) => student !== null);

  // *************** retuning the result and filter it not to showing null value
  return filterResult;
}

const schoolResolvers = {
  Query: {
    GetAllSchools,
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
module.exports = schoolResolvers;
