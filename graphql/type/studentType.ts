

// Define graphql 
const studentType = '

    scalar date

    type Student {
        id:ID!
        firstName:String!
        lastName:String!
        email:String!
        role:String!
        deletedAt:Date
    }
    '