// *************** TYPE DEFINITION: User ***************

// *************** User Type
const userType =`

    type User {
        id:ID!
        first_name:String!
        last_name:String!
        email:String!
        password:String!
        role:String!
        status:String!
        deleted_at:Date
    }
    input UserInput{
        id:ID
        first_name:String!
        last_name:String!
        email:String!
        password:String!
        role:String! 
    }

    
`;

// *************** User Query
const UserQuery = `
    extend type Query {

        GetAllUser: [User]
        GetUserById(id: ID!): User
    }
`;

// *************** User Mutation
const UserMutation =`
extend type Mutation{
    CreateUser(
        userInput: UserInput!): User!    
    
    UpdateUser(
        id:ID!,userInput: UserInput!): User
        
    DeleteUser(
        id: ID!): User
    }
`;

// *************** EXPORT MODULE ***************
module.exports = { userType, UserQuery, UserMutation };