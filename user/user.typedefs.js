// *************** TYPE DEFINITION: User ***************

// *************** User address Type
const userAddressType = `
    type UserAddress{
    street:String!
    city:String!
    province:String!
    postal_code:String!
    }`;

// *************** User Type
const userType = `

    input UserAddressInput{
    street:String!
    city:String!
    province:String!
    postal_code:String!
    }

    type User {
        _id:ID!
        first_name:String!
        last_name:String!
        civility:String!
        office_phone:String
        direct_line:String
        mobile_phone:String
        entity:String!
        address:[UserAddress]!
        email:String!
        password:String!
        role:String!
        status:String!
        deleted_at:Date
    }
    input UserInput{
        _id:ID
        first_name:String!
        last_name:String!
        civility:String!
        office_phone:String
        direct_line:String
        mobile_phone:String!
        entity:String!
        address:[UserAddressInput]!
        email:String!
        password:String!
        role:String! 
    }

    
`;

// *************** User Query
const UserQuery = `
    extend type Query {

        GetAllUser: [User]
        GetUserById(_id: ID!): User
    }
`;

// *************** User Mutation
const UserMutation = `
extend type Mutation{
    CreateUser(
        user_input: UserInput!): User!    
    
    UpdateUser(
        _id:ID!,user_input: UserInput!): User
        
    DeleteUser(
        _id: ID!): User
    }
`;

// *************** EXPORT MODULE ***************
module.exports = { userType, UserQuery, UserMutation, userAddressType };
