// *************** TYPE DEFINITION : Student  ***************

// *************** Student Type
const studentType = `

type Student{
    id:ID!
    first_name:String!
    last_name:String!
    email:String!
    date_of_birth:Date
    school_id:ID!
    school:School
    school_history:[School]
    status:String!
    deleted_at:String
    }

input StudentInput{
    id:ID
    first_name:String!
    last_name:String!
    email:String!
    date_of_birth:Date
    school_id:ID!
    deleted_at:String
    }
     
`;

// *************** Student Query
const StudentQuery = `
    extend type Query {
        GetAllStudent: [Student]
        GetStudentById(id: ID!): Student
    }
`;

// *************** Student Mutation
const StudentMutation =`
    extend type Mutation{
        CreateStudent(
            studentInput: StudentInput!): Student!

        UpdateStudent(
            id:ID!,studentInput: StudentInput!): Student

        DeleteStudent(
            id: ID!): Student
    }
    `;

// *************** EXPORT MODULE ***************
module.exports = { studentType, StudentQuery, StudentMutation };