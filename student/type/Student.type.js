// *************** TYPE DEFINITION : Student  ***************
export const studentType = `

type Student{

    #Student ID
    id:ID!

    #Student first name
    firstName:String!

    #Student last name
    lastName:String!

    #Student email
    email:String!

    #student date of birth
    dateOfBirth:Date

    #School ID student belong to
    schoolId:ID!

    #Date when soft delete
    deletedAt:String
    }
`;