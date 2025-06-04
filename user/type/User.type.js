// *************** TYPE DEFINITION: User ***************
export const userType =`

    type User {
        #User id
        id:ID!

        #User first name
        firstName:String!

        #User last name
        lastName:String!

        #User email
        email:String!

        #User role
        role:String!

        #Date when soft delete
        deletedAt:Date
    }
`;