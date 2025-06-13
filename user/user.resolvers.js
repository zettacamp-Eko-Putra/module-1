// *************** IMPORT MODULE ***************
const User = require("./user.models.js");

// *************** IMPORT VALIDATOR ***************
const { ValidateUserInput } = require("./user.validator.js");

/**
 * Retrieves all users with active status from the database.
 *
 * @async
 * @function GetAllUser
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of active user objects.
 */
async function GetAllUsers() {
  // *************** find user data with status active
  const activeUser = await User.find({ status: "active" });

  // *************** returning user data with status active
  return activeUser;
}

/**
 * Fetches all users from the database whose status is set to "active".
 *
 * @async
 * @function GetAllUser
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of active user objects.
 */
async function GetUserById(parent, { _id }) {
  // *************** finding user based on id
  const user = await User.findById(_id).lean();

  // *************** creating if to showing message if the user cannot be found
  if (!user) {
    // *************** error message if the user cannot be found in database
    throw new Error("User Not Found");
  }

  // *************** returning user data if user in database
  return user;
}

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
  // *************** validate user_input
  ValidateUserInput(user_input);

  // *************** check if the email already taken by another user
  const isEmailAlreadyExist = await User.exists({ email: user_input.email });

  // *************** creating if to showing message if the email already taken by another user
  if (isEmailAlreadyExist) {
    // *************** error message if the email already taken
    throw new Error("Email taken");
  }

  // *************** creating new user based on the userInput
  const createdUser = await User.create(user_input);

  // *************** returning new user data
  return createdUser;
}

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
  // *************** validate user_input
  ValidateUserInput(user_input);

  // *************** creating if to showing error message if the user tried to update their id
  if (user_input._id) {
    // *************** error message if user tried to update their id
    throw new Error("Cannot update User ID");
  }

  // *************** finding user based on id and overwrite it with new data and saving it to database
  const updatedUser = await User.findByIdAndUpdate(_id, user_input, {
    new: true,
  });

  // *************** creating if to showing error message if the user id cannot be found in database
  if (!updatedUser) {
    // *************** message if user id cannot be found in database
    throw new Error("User not found");
  }

  // *************** returning user updated data to user
  return updatedUser;
}

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
  // *************** finding user based on id and update the data
  const deleteUser = await User.findByIdAndUpdate(
    _id,
    {
      // *************** changing status field to deleted and adding timestamp
      status: "deleted",
      deleted_at: new Date(),
    },

    // *************** Update the Data
    { new: true }
  );

  // *************** creating if to showing error message if user id cannot be found in database
  if (!deleteUser) {
    // *************** message if the user id cannot be found in database
    throw new Error("User not found");
  }

  // *************** returning user deleted data to user
  return deleteUser;
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
