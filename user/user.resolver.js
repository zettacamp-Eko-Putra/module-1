// *************** Resolver: User ***************
const User =  require('./user.model.js');
const { v4: uuidv4 } = require('uuid');
const Users = [];

// *************** Resolver: School ***************
const userResolvers = {
  Query: {
    getAllUser: async () => {
      return await User.find({ deletedAt: null });
    },
    getUserById: async (_, { id }) => {
      return await User.findById(id);
    }
  },
  Mutation: {
  createUser: async (parent, args) => {
    const emailTaken = Users.some((user) => user.email === args.email)
    if (emailTaken){
      throw new Error('Email taken')
    }
    const user = {
      id: uuidv4(),
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      password: args.password,
      role: args.role
    }
    const createdUser = await User.create(user);
    console.log("Data berhasil disimpan:", createdUser);
    return createdUser;
    },

    updateUser:async(_,{id, ...updateData})=> {
      if(updateData.id){
        throw new Error ("Cannot update User ID")
      }
      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new:true });

      if (!updatedUser){
        throw new Error("User not found")
      }
      return updatedUser;
    },

    deleteUser:async(_,{ id }) => {
      const deleteUser = await User.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new:true }
      );
      if (!deleteUser){
        throw new Error("User not found");
      } 
      return deleteUser
    }
}

};
module.exports = { userResolvers };