// *************** IMPORT MODULE *************** 
const User =  require('./user.models.js');
const users = [];


// *************** LOGIC *************** 
// *************** Get all User
async function GetAllUser() {
  return await User.find({ status:"active" });
}

// *************** Get User by Id
async function GetUserById(_,{id}) {
  const user = await User.findById(id);
        if (!user){
          throw new Error("User Not Found")
        }
        return user;
}

// *************** Create User
async function CreateUser(_, {userInput}){
    const emailTaken = users.some((user) => user.email === userInput.email)
    if (emailTaken){
      throw new Error('Email taken')
    }

    const createdUser = await User.create(userInput);
    console.log("User has Created:", createdUser);
    return createdUser;
}

// *************** Update User
async function UpdateUser(_, { id, userInput }) {
  if (userInput.id) {
    throw new Error("Cannot update User ID");
  }
  const updatedUser = await User.findByIdAndUpdate(id, userInput, { new: true });

  if (!updatedUser) {
    throw new Error("User not found");
  }
  return updatedUser;
}

// *************** Delete User
async function DeleteUser(_,{id}){
  const deleteUser = await User.findByIdAndUpdate(
        id,
        { 
          status:"deleted",
          deleted_at: new Date()
        },
        { new:true }
      );
      if (!deleteUser){
        throw new Error("User not found");
      } 
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