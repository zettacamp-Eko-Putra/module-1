// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.models.js');

// *************** IMPORT UTILITIES ***************
const ValidateIdMongoose = require(`../utilities/id_validator.js`);

// *************** IMPORT VALIDATOR ***************
const { ValidateUserInput } = require('./user.validator.js');

// *************** QUERY ***************
// *************** Get all user function
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
    const activeUser = await UserModel.find({ status: 'active' }).lean();

    // *************** returning user data with status active
    return activeUser;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** Get user by id function
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
// *************** Create user function
/**
 * Creates a new user if the provided email is not already in use.
 *
 * @async
 * @function CreateUser
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing user input.
 * @param {object} user_input - The user data to be saved.
 * @param {string} user_input.email - The user's email address.
 * @returns {Promise<object>} - A promise that resolves to the newly created user object.
 * @throws {Error} - Throws an error if the email is already taken.
 */
async function CreateUser(parent, { user_input }) {
  try {
    // *************** validate user_input
    await ValidateUserInput(user_input);

    // *************** check if the email already taken by another user
    const isEmailAlreadyExist = await UserModel.exists({
      email: user_input.email.trim().toLowerCase(),
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
      email: user_input.email,
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

// *************** Update user function
/**
 * Updates an existing user's data based on the provided ID.
 * Prevents the user from modifying their own ID.
 *
 * @async
 * @function UpdateUser
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the user ID and updated data.
 * @param {string} _id - The ID of the user to update.
 * @param {object} user_input - The data to update the user with.
 * @returns {Promise<object>} - A promise that resolves to the updated user object.
 * @throws {Error} - Throws an error if the ID is being updated or if the user is not found.
 */
async function UpdateUser(parent, { _id, user_input }) {
  try {
    // *************** showing error message if the user tried to update their id
    if (user_input._id) {
      throw new ApolloError('Cannot update User ID');
    }

    // *************** validate Id
    await ValidateIdMongoose(_id);

    // *************** validate user_input
    await ValidateUserInput(user_input);

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
      email: user_input.email,
      password: user_input.password,
      role: user_input.role,
    };

    // *************** finding user based on id and overwrite it with new data and saving it to database
    const updatedUser = await UserModel.findByIdAndUpdate(
      _id,
      { $set: userData },
      { new: true }
    );

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

// *************** Delete User function
/**
 * Soft deletes a user by updating their status to "deleted" and setting a deletion timestamp.
 *
 * @async
 * @function DeleteUser
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the user ID.
 * @param {string} _id - The ID of the user to delete.
 * @returns {Promise<object>} - A promise that resolves to the soft-deleted user object.
 * @throws {Error} - Throws an error if the user is not found.
 */
async function DeleteUser(parent, { _id }) {
  try {
    // *************** validate Id
    await ValidateIdMongoose(_id);

    // *************** finding user based on id and update the data
    const deleteUser = await UserModel.findOneAndUpdate(
      { _id, status: { $ne: `deleted` } },
      {
        // *************** changing status field to deleted and adding timestamp
        status: 'deleted',
        deleted_at: new Date(),
      }
    );

    // *************** showing error message if user id cannot be found in database
    if (!deleteUser) {
      throw new ApolloError('User already deleted');
    }

    // *************** returning user deleted data to user
    return deleteUser;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

const userResolvers = {
  // *************** QUERY ***************
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

// *************** EXPORT MODULE ***************
module.exports = userResolvers;
