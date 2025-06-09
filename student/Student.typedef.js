// *************** TYPE DEFINITION : Student  ***************
const studentType = `

type Student{
    id:ID!
    first_name:String!
    last_name:String!
    email:String!
    date_of_birth:Date
    school_id:ID!
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

const StudentQuery = `
    extend type Query {
        students: [Student]
        student(id: ID!): Student
    }
`;
const StudentMutation =`
    extend type Mutation{
        createStudent(
            studentInput: StudentInput!): Student!
    }
    `;

// *************** EXPORT MODULE ***************
module.exports = { studentType, StudentQuery, StudentMutation };