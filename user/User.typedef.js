// *************** TYPE DEFINITION: User ***************
const userType =`

    type User {
        id:ID!
        first_name:String!
        last_name:String!
        email:String!
        password:String!
        role:String!
        status:String!
        deletedAt:Date
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
const UserQuery = `
    extend type Query {

        GetAllUser: [User]
        GetUserById(id: ID!): User
    }
`;

const UserMutation =`
extend type Mutation{
    CreateUser(
        userInput: UserInput!): User!    
    
    UpdateUser(
        userInput: UserInput!): User
        
    DeleteUser(
        id: ID!): User
    }
`;

// *************** EXPORT MODULE ***************
module.exports = { userType, UserQuery, UserMutation };