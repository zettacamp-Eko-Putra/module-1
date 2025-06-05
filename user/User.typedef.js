// *************** TYPE DEFINITION: User ***************
const userType =`

    type User {
        #User id
        id:ID!

        #User first name
        firstName:String!

        #User last name
        lastName:String!

        #User email
        email:String!

        #User password
        password:String!

        #User role
        role:String!

        #Date when soft delete
        deletedAt:Date
    }
    
`;
const UserQuery = `
    extend type Query {

        getAllUser: [User]
        getUserById(id: ID!): User
    }
`;

const UserMutation =`
type Mutation{
    createUser(
        firstName:String!,
        lastName:String!,
        email:String!,
        password:String!,
        role:String!): User!    
    

    updateUser(
        id: ID!,
        firstName:String,
        lastName:String,
        email:String,
        password:String,
        role:String): User
        
    deleteUser(
        id: ID!): User
    }
            `;
module.exports = { userType, UserQuery, UserMutation };