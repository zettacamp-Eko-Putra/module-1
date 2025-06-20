// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.models.js');

// *************** IMPORT VALIDATOR ***************
const { ValidateUserInput } = require('./user.validator.js');
const ValidateIdMongoose = require(`../../utilities/common-validator/mongo-validator.js`);

// *************** QUERY ***************
/**
 * Retrieves all users with active status from the database.
 *
 * @async
 * @function GetAllUser
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of active user objects.
 */
async function GetAllUsers() {
  try {
    // *************** find user data with status active
    const activeUsers = await UserModel.find({ status: 'active' }).lean();

    // *************** returning user data with status active
    return activeUsers;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a user document by its unique ID.
 *
 * This function searches for a user in the database using the provided `_id`.
 * If the user is not found, it throws an error.
 *
 * @async
 * @function GetUserById
 * @param {object} parent - Unused GraphQL parent resolver parameter.
 * @param {object} args - The arguments object.
 * @param {string} _id - The ID of the user to retrieve.
 * @returns {Promise<object>} - A promise that resolves to the user object.
 * @throws {Error} - Throws an error if the user is not found.
 */
async function GetUserById(parent, { _id }) {
  try {
    // *************** validate Id
    ValidateIdMongoose(_id);

    // *************** finding user based on id
    const user = await UserModel.findById(_id).lean();

    // *************** showing message if the user cannot be found
    if (!user) {
      throw new ApolloError(`User Not Found`);
    }

    // *************** returning user data if user in database
    return user;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** MUTATION ***************
/**
 * Creates a new user after validating the input and checking for email uniqueness.
 *
 * This function performs input validation, checks if the email is already used,
 * and saves the new user to the database.
 *
 * @async
 * @function CreateUser
 * @param {object} parent - GraphQL parent resolver (unused).
 * @param {object} args - Arguments object containing the user input.
 * @param {object} args.user_input - The input data for creating the user.
 * @param {string} args.user_input.first_name - User's first name.
 * @param {string} args.user_input.last_name - User's last name.
 * @param {string} args.user_input.civility - User's civility (e.g., "Mr", "Mrs").
 * @param {string} [args.user_input.office_phone] - Optional office phone number.
 * @param {string} [args.user_input.direct_line] - Optional direct line number.
 * @param {string} args.user_input.mobile_phone - User's mobile phone number.
 * @param {string} args.user_input.entity - The entity the user belongs to.
 * @param {Array<object>} args.user_input.address - Array of address objects.
 * @param {string} args.user_input.email - User's email address.
 * @param {string} args.user_input.password - User's password.
 * @param {string} args.user_input.role - User's role in the system.
 *
 * @returns {Promise<object>} - A promise that resolves to the newly created user object.
 *
 * @throws {ApolloError} - Throws error if input validation fails or the email is already used.
 */
async function CreateUser(parent, { user_input }) {
  try {
    // *************** validate user_input
    ValidateUserInput(user_input);

    // *************** check if the email already taken by another user
    const isEmailAlreadyExist = await UserModel.exists({
      email: user_input.email.trim().toLowerCase(),
      status: 'active',
    });

    // *************** showing message if the email already taken by another user
    if (isEmailAlreadyExist) {
      throw new ApolloError('Email taken');
    }

    // *************** breakdown user input
    const userData = {
      first_name: user_input.first_name,
      last_name: user_input.last_name,
      civility: user_input.civility,
      office_phone: user_input.office_phone,
      direct_line: user_input.direct_line,
      mobile_phone: user_input.mobile_phone,
      entity: user_input.entity,
      address: user_input.address,
      email: user_input.email.trim().toLowerCase(),
      password: user_input.password,
      role: user_input.role,
    };

    // *************** creating new user based on the userInput
    const createdUser = await UserModel.create(userData);

    // *************** returning new user data
    return createdUser;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Updates an existing user's information after validating the ID and input data.
 *
 * This function performs validation on the provided user ID and input, updates the user's
 * details in the database, and returns the ID of the updated user.
 *
 * @async
 * @function UpdateUser
 * @param {object} parent - GraphQL parent resolver (unused).
 * @param {object} args - Arguments object.
 * @param {string} args._id - The unique ID of the user to update.
 * @param {object} args.user_input - The new data for the user.
 * @param {string} args.user_input.first_name - User's first name.
 * @param {string} args.user_input.last_name - User's last name.
 * @param {string} args.user_input.civility - User's civility ("Mr", "Mrs").
 * @param {string} [args.user_input.office_phone] - Optional office phone number.
 * @param {string} [args.user_input.direct_line] - Optional direct line number.
 * @param {string} args.user_input.mobile_phone - User's mobile phone number.
 * @param {string} args.user_input.entity - The entity the user belongs to.
 * @param {Array<object>} args.user_input.address - Array of address objects.
 * @param {string} args.user_input.email - User's email address.
 * @param {string} args.user_input.password - User's password.
 * @param {string} args.user_input.role - User's role in the system.
 *
 * @returns {Promise<{ _id: string }>} - A promise that resolves to an object containing the updated user ID.
 *
 * @throws {ApolloError} - Throws error if validation fails or user is not found.
 */
async function UpdateUser(parent, { _id, user_input }) {
  try {
    // *************** validate Id and user_input
    ValidateIdMongoose(_id);
    ValidateUserInput(user_input);

    // *************** breakdown user input
    const userData = {
      first_name: user_input.first_name,
      last_name: user_input.last_name,
      civility: user_input.civility,
      office_phone: user_input.office_phone,
      direct_line: user_input.direct_line,
      mobile_phone: user_input.mobile_phone,
      entity: user_input.entity,
      address: user_input.address,
      email: user_input.email.trim().toLowerCase(),
      password: user_input.password,
      role: user_input.role,
    };

    // *************** finding user based on id and overwrite it with new data and saving it to database
    const updatedUser = await UserModel.findByIdAndUpdate(
      _id,
      { $set: userData },
      { new: true }
    ).lean();

    // *************** showing error message if the user id cannot be found in database
    if (!updatedUser) {
      throw new ApolloError('User not found');
    }

    // *************** returning user updated data to user
    return updatedUser;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft-deletes a user by updating their status to "deleted" and setting a deletion timestamp.
 *
 * This function first validates the provided user ID, then checks if the user exists and is not already deleted.
 * If found, it updates the `status` field to `'deleted'` and sets the `deleted_at` timestamp.
 *
 * @async
 * @function DeleteUser
 * @param {object} parent - GraphQL parent resolver (unused).
 * @param {object} args - The arguments object.
 * @param {string} args._id - The ID of the user to be deleted.
 *
 * @returns {Promise<{ _id: string }>} - A promise that resolves to an object containing the deleted user's ID.
 *
 * @throws {ApolloError} - Throws an error if the ID is invalid or the user is already deleted.
 */
async function DeleteUser(parent, { _id }) {
  try {
    // *************** validate Id
    ValidateIdMongoose(_id);

    // *************** finding user based on id and update the data
    const deleteUser = await UserModel.findByIdAndUpdate(_id, {
      // *************** changing status field to deleted and adding timestamp
      status: 'deleted',
      deleted_at: new Date(),
    })
      .select('_id')
      .lean();

    // *************** showing error message if user id cannot be found in database
    if (!deleteUser) {
      throw new ApolloError('User already deleted');
    }

    // *************** returning user deleted data to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllUsers,
    GetUserById,
  },

  // *************** MUTATION ***************
  Mutation: {
    CreateUser,
    UpdateUser,
    DeleteUser,
  },
};
