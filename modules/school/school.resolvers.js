// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const SchoolModel = require('./school.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateSchoolInput } = require('./school.validator.js');
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

// *************** QUERY ***************
/**
 * Query resolver to retrieve all schools with status "active".
 *
 * This query fetches all School documents from the database
 * where the `status` field is equal to `'active'`.
 *
 * @async
 * @function GetAllSchools
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of active school documents.
 *
 * @throws {ApolloError} - Throws an ApolloError if a database error occurs.
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
 * - Returns the school document if found.
 *
 * @async
 * @function GetOneSchool
 * @param {object} parent - Unused parent argument (GraphQL resolver pattern).
 * @param {object} args - The arguments object.
 * @param {string} args._id - The ID of the school to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the school object.
 * @throws {ApolloError} - Throws if the ID is invalid or the school is not found.
 */
async function GetOneSchool(_, { _id }) {
  try {
    // *************** Validating school id
    ValidateIdMongoose(_id, '_id');

    // *************** finding school based on id and status
    const school = await SchoolModel.findOne({ _id, status: 'active' }).lean();

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
async function CreateSchool(_, { school_input }) {
  try {
    // *************** validate school_input
    ValidateSchoolInput(school_input);

    // *************** Remove leading and trailing spaces from school legal name
    const inputName = school_input.school_legal_name.trim();

    // *************** find exists school legal name in database
    const isSchoolLegalNameAlreadyExists = await SchoolModel.exists({
      school_legal_name: { $regex: `^${inputName}$`, $options: 'i' },
      status: 'active',
    });

    // *************** Throwing error if there's exact name in database
    if (isSchoolLegalNameAlreadyExists) {
      throw new ApolloError('School legal name already exists');
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
async function UpdateSchool(_, { _id, school_input }) {
  try {
    // *************** Validating school id and school input
    ValidateIdMongoose(_id, '_id');
    ValidateSchoolInput(school_input);

    // *************** Remove leading and trailing spaces from school legal name
    const inputName = school_input.school_legal_name.trim().toLowerCase();

    // *************** Find current school by id
    const currentSchool = await SchoolModel.findById(_id).lean();

    // *************** Take current school legal name
    const currentSchoolName = currentSchool.school_legal_name
      .trim()
      .toLowerCase();

    // *************** Only check duplication if legal name changed
    if (inputName !== currentSchoolName) {
      const isSchoolLegalNameAlreadyExists = await SchoolModel.exists({
        school_legal_name: { $regex: `^${inputName}$`, $options: 'i' },
        status: 'active',
      });

      if (isSchoolLegalNameAlreadyExists) {
        throw new ApolloError('School legal name already exists');
      }
    }

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
 * Soft deletes a school by setting its status to "deleted" and recording a deletion timestamp.
 *
 * This function validates the provided school ID, updates the school's status to "deleted",
 * and returns the ID of the deleted school. If the school is not found or already deleted,
 * an error is thrown.
 *
 * @async
 * @function DeleteSchool
 * @param {object} parent - GraphQL parent resolver (unused).
 * @param {object} args - The arguments object.
 * @param {string} args._id - The ID of the school to delete.
 *
 * @returns {Promise<string>} - A promise that resolves to the ID of the deleted school.
 *
 * @throws {ApolloError} - Throws if the ID is invalid or the school is not found or already deleted.
 */
async function DeleteSchool(_, { _id }) {
  try {
    // *************** checking if the school id is valid
    ValidateIdMongoose(_id, '_id');

    // *************** finding school and update the data
    const deleteSchool = await SchoolModel.findOneAndUpdate(
      { _id, status: { $ne: 'deleted' } },
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
    return _id;
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
 * @function Students
 * @param {object} parent - The parent object containing the `students` field (typically a school).
 * @param {object} args - GraphQL arguments (unused).
 * @param {object} ctx - GraphQL context object containing the DataLoader instances.
 * @param {DataLoader} ctx.loaders.student - DataLoader instance for batching and caching student lookups.
 *
 * @returns {Promise<object[]>} - A promise resolving to an array of student objects.
 */
async function students(parent, _, ctx) {
  // *************** creating if to check if the school student array empty
  if (!parent.students || !parent.students.length) {
    // *************** retuning value if student array empty
    return [];
  }

  // *************** retuning the result to the caller
  return await ctx.loaders.StudentLoader.loadMany(parent.students);
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllSchools,
    GetOneSchool,
  },
  Mutation: {
    CreateSchool,
    UpdateSchool,
    DeleteSchool,
  },
  School: {
    students: students,
  },
};
