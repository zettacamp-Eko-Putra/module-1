// *************** TYPE DEFINITION : Student  ***************

// *************** Student address type
const studentAddressType =`
    type StudentAddress{
    street:String!
    city:String!
    province:String!
    postal_code:String!
    }    
`

// *************** Student Type
const studentType = `

input StudentAddressInput{
    street:String!
    city:String!
    province:String!
    postal_code:String!
    } 

type Student{
    id:ID!
    first_name:String!
    last_name:String!
    email:String!
    civility:String!
    postal_code_of_birth:String!
    mobile_phone:String!
    address:[StudentAddress]!
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
    civility:String!
    postal_code_of_birth:String!
    mobile_phone:String!
    address:[StudentAddressInput]!
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
module.exports = { studentType, StudentQuery, StudentMutation, studentAddressType };