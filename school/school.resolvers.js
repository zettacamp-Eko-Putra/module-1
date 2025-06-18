// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.models.js');

// *************** IMPORT UTILITIES ***************
const ValidateIdMongoose = require(`../utilities/id_validator.js`);

// *************** IMPORT VALIDATOR ***************
const { ValidateSchoolInput } = require('./school.validator.js');
const { ApolloError } = require('apollo-server');

// *************** QUERY ***************

// *************** Get All School function
/**
 * Retrieves all school documents with status set to "active".
 *
 * @async
 * @function GetAllSchools
 * @returns {Promise<object[]>} - A promise that resolves to an array of active school objects.
 */
async function GetAllSchools() {
  // *************** find school data with status active
  const activeSchool = await SchoolModel.find({ status: 'active' }).lean();

  // *************** returning school data with status active
  return activeSchool;
}

// *************** Get School by Id function
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
  // *************** Validating school id
  ValidateIdMongoose(_id);

  // *************** finding school based on id
  const school = await SchoolModel.findById(_id).lean();

  // *************** showing message if the school cannot be found
  if (!school) {
    throw new ApolloError('School not found');
  }

  // *************** returning user data if user in database
  return school;
}

// *************** MUTATION ***************

// *************** Create school function
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
  const inputNameLower = school_input.school_legal_name.trim().toLowerCase();

  // *************** find matching school by legal name
  const matchingSchool = await SchoolModel.aggregate([
    {
      $addFields: {
        school_legal_name_lowercase: { $toLower: '$school_legal_name' },
      },
    },
    {
      $match: {
        school_legal_name_lowercase: inputNameLower,
        status: 'active',
      },
    },
  ]).allowDiskUse(true);

    // *************** showing error message if school legal name already exists
  if (matchingSchool.length) {
    throw new ApolloError('School name already exists');
  }

  // *************** breakdown the school input
  const schoolData = {
    school_commercial_name: school_input.school_commercial_name,
    school_legal_name: school_input.school_legal_name,
    address: school_input.address,
  };

  // *************** creating new school based on the schoolInput
  const createdSchool = await SchoolModel.create(schoolData);

  // *************** returning new school data
  return createdSchool;
}

// *************** Update School function
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
  // *************** showing error message if the school tried to update their id
  if (school_input._id) {
    throw new ApolloError('Cannot update School ID');
  }

  // *************** Validating school id
  await ValidateIdMongoose(_id);

  // *************** validate school_input
  await ValidateSchoolInput(school_input);

  // *************** breakdown school input
  const schoolData = {
    school_commercial_name: school_input.school_commercial_name,
    school_legal_name: school_input.school_legal_name,
    address: school_input.address,
  };

  // *************** finding school based on id and overwrite it with new data and saving it to database
  const updatedSchool = await SchoolModel.findByIdAndUpdate(
    _id,
    { $set: schoolData },
    { new: true }
  );

  // ***************  showing error message if the school id cannot be found in database
  if (!updatedSchool) {
    throw new ApolloError('School not Found');
  }

  // *************** returning school updated data to user
  return updatedSchool;
}

// *************** Delete school function
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
  // *************** checking if the school id is valid
  await ValidateIdMongoose(_id);

  // *************** finding school and update the data
  const deleteSchool = await SchoolModel.findOneAndUpdate(
    { _id, status: { $ne: 'deleted' } },
    {
      // *************** changing status field to deleted and adding timestamp
      status: 'deleted',
      deleted_at: new Date(),
    }
  );

  // *************** showing error message if school already deleted
  if (!deleteSchool) {
    throw new ApolloError('School already deleted');
  }

  // *************** returning school deleted data to user
  return deleteSchool;
}

// *************** LOADER ***************

// *************** Get student data using loader function
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
  if (!parent.students || !parent.students.length) {
    // *************** retuning value if student array empty
    return [];
  }

  // *************** taking student data using data loader
  const result = await loaders.students.loadMany(parent.students);

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
