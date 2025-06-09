// *************** IMPORT MODULE *************** 
const User =  require('./User.model.js');
const Users = [];


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
    const emailTaken = Users.some((user) => user.email === userInput.email)
    if (emailTaken){
      throw new Error('Email taken')
    }

    const createdUser = await User.create(userInput);
    console.log("Data berhasil disimpan:", createdUser);
    return createdUser;
}

// *************** Update User
async function UpdateUser(_, { id, ...updateData }) {
  if (updateData.id) {
    throw new Error("Cannot update User ID");
  }
  const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

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
          deletedAt: new Date()
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