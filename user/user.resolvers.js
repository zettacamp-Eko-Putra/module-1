// *************** IMPORT MODULE *************** 
const User =  require('./user.models.js');
const users = [];


// *************** LOGIC *************** 
// *************** Get all User
/**
 * Retrieves all users with active status from the database.
 * 
 * @async
 * @function GetAllUser
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of active user objects.
 */
async function GetAllUser() {

  // returning user data with status active
  return await User.find({ status:"active" });
}

// *************** Get User by Id
/**
 * Fetches all users from the database whose status is set to "active".
 *
 * @async
 * @function GetAllUser
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of active user objects.
 */
async function GetUserById(_,{id}) {

  // finding user based on id
  const user = await User.findById(id);

        // creating if to showing message if the user cannot be found
        if (!user){

          // error message if the user cannot be found in database
          throw new Error("User Not Found")
        }

        // returning user data if user in database
        return user;
}

// *************** Create User
/**
 * Creates a new user if the provided email is not already in use.
 *
 * @async
 * @function CreateUser
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing user input.
 * @param {object} args.userInput - The user data to be saved.
 * @param {string} args.userInput.email - The user's email address.
 * @returns {Promise<object>} - A promise that resolves to the newly created user object.
 * @throws {Error} - Throws an error if the email is already taken.
 */
async function CreateUser(_, {userInput}){

    // check if the email already taken by another user
    const emailTaken = users.some((user) => user.email === userInput.email)

    // creating if to showing message if the email already taken by another user
    if (emailTaken){

      // error message if the email already taken
      throw new Error('Email taken')
    }

    // creating new user based on the userInput
    const createdUser = await User.create(userInput);

    // showing log message if the user already created
    console.log("User has Created:", createdUser);

    // returning new user data
    return createdUser;
}

// *************** Update User
/**
 * Updates an existing user's data based on the provided ID.
 * Prevents the user from modifying their own ID.
 *
 * @async
 * @function UpdateUser
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the user ID and updated data.
 * @param {string} args.id - The ID of the user to update.
 * @param {object} args.userInput - The data to update the user with.
 * @returns {Promise<object>} - A promise that resolves to the updated user object.
 * @throws {Error} - Throws an error if the ID is being updated or if the user is not found.
 */
async function UpdateUser(_, { id, userInput }) {
  // creating if to showing error message if the user tried to update their id
  if (userInput.id) {

    // error message if user tried to update their id
    throw new Error("Cannot update User ID");
  }

  // finding user based on id and overwrite it with new data and saving it to database
  const updatedUser = await User.findByIdAndUpdate(id, userInput, { new: true });

  // creating if to showing error message if the user id cannot be found in database
  if (!updatedUser) {

    // message if user id cannot be found in database
    throw new Error("User not found");
  }

  // returning user updated data to user
  return updatedUser;
}

// *************** Delete User
/**
 * Soft deletes a user by updating their status to "deleted" and setting a deletion timestamp.
 *
 * @async
 * @function DeleteUser
 * @param {any} _ - Unused parent resolver parameter.
 * @param {object} args - Arguments containing the user ID.
 * @param {string} args.id - The ID of the user to delete.
 * @returns {Promise<object>} - A promise that resolves to the soft-deleted user object.
 * @throws {Error} - Throws an error if the user is not found.
 */
async function DeleteUser(_,{id}){

  // finding user based on id and update the data
  const deleteUser = await User.findByIdAndUpdate(
        id,
        { 
          // changing status field to deleted
          status:"deleted",

          // adding timestamp to deleted_at field
          deleted_at: new Date()
        },

        // overwrite the old data with new one
        { new:true }
      );

      // creating if to showing error message if user id cannot be found in database
      if (!deleteUser){

        // message if the user id cannot be found in database
        throw new Error("User not found");
      } 

      // returning user deleted data to user
      return deleteUser
}



const userResolvers = {
  // *************** QUERY *************** 
  Query: {
    GetAllUser,
    GetUserById
  },

  // *************** MUTATION *************** 
  Mutation: {
  CreateUser,
  UpdateUser,
  DeleteUser
}

};

// *************** EXPORT MODULE ***************
module.exports = { userResolvers };