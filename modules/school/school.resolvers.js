// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateSchoolInput } = require('./school.validator.js');
const ValidateIdMongoose = require(`../../utilities/common-validator/mongo-validator.js`);

// *************** QUERY ***************
/**
 * Retrieves all school documents from the database with a status of "active".
 * This function uses `.lean()` for improved performance by returning plain JavaScript objects.
 *
 * @async
 * @function GetAllSchools
 * @returns {Promise<Object[]>} - A promise that resolves to an array of active school objects.
 * @throws {ApolloError} - Throws an ApolloError if the database query fails.
 */
async function GetAllSchools() {
  try {
    // *************** find school data with status active
    const activeSchools = await SchoolModel.find({ status: 'active' }).lean();

    // *************** returning school data with status active
    return activeSchools;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a school document from the database by its unique ID.
 * - Validates the provided ID.
 * - Returns the school document if found and active.
 *
 * @async
 * @function GetSchoolById
 * @param {object} parent - Unused parent argument (GraphQL resolver pattern).
 * @param {object} args - The arguments object.
 * @param {string} args._id - The ID of the school to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the school object.
 * @throws {ApolloError} - Throws if the ID is invalid or the school is not found.
 */
async function GetSchoolById(parent, { _id }) {
  try {
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
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
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
  try {
    // *************** validate school_input
    ValidateSchoolInput(school_input);

    // *************** Changing school input legal name to lower case
    const inputNameLower = school_input.school_legal_name.trim().toLowerCase();

    // *************** find matching school by legal name
    const matchingSchool = await SchoolModel.aggregate([
      {
        $project: {
          school_legal_name: 1,
          status: 1,
        },
      },
      {
        $addFields: {
          school_legal_name_lowercase: { $toLower: '$school_legal_name' },
        },
      },
      {
        $match: {
          school_legal_name_lowercase: inputNameLower,
          status: `active`,
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
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
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
  try {
    // *************** Validating school id and school input
    ValidateIdMongoose(_id);
    ValidateSchoolInput(school_input);

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
    ).lean();

    // ***************  showing error message if the school id cannot be found in database
    if (!updatedSchool) {
      throw new ApolloError('School not Found');
    }

    // *************** returning school updated data to user
    return updatedSchool;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
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
  try {
    // *************** checking if the school id is valid
    ValidateIdMongoose(_id);

    // *************** finding school and update the data
    const deleteSchool = await SchoolModel.findByIdAndUpdate(
      { _id },
      {
        // *************** changing status field to deleted and adding timestamp
        status: 'deleted',
        deleted_at: new Date(),
      }
    )
      .select('_id')
      .lean();

    // *************** showing error message if school already deleted
    if (!deleteSchool) {
      throw new ApolloError('School already deleted');
    }

    // *************** returning school deleted data to user
    return { _id };
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** LOADER ***************
/**
 * Retrieves student data associated with a school using DataLoader.
 *
 * Loads all students referenced in the `students` array of the parent school object.
 * Returns an empty array if no students are associated.
 *
 * @async
 * @function GetStudentsData
 * @param {object} parent - The parent object containing the `students` field (typically a school).
 * @param {object} args - GraphQL arguments (unused).
 * @param {object} ctx - GraphQL context object containing the DataLoader instances.
 * @param {DataLoader} ctx.loaders.student - DataLoader instance for batching and caching student lookups.
 *
 * @returns {Promise<object[]>} - A promise resolving to an array of student objects.
 */
async function Students(parent, args, ctx) {
  // *************** creating if to check if the school student array empty
  if (!parent.students || !parent.students.length) {
    // *************** retuning value if student array empty
    return [];
  }

  // *************** retuning the result to the caller
  return await ctx.loaders.student.loadMany(parent.students);
}

// *************** EXPORT MODULE ***************
module.exports = {
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
    students: Students,
  },
};
