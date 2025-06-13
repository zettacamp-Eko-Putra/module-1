// *************** TYPE DEFINITION : Student  ***************

// *************** Student address type
const studentAddressType = `
type StudentAddress{
    street:String!
    city:String!
    province:String!
    postal_code:String!
}    
`;

// *************** Student Type
const studentType = `
input StudentAddressInput{
    street:String!
    city:String!
    province:String!
    postal_code:String!
} 

type Student{
    _id:ID!
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
    _id:ID
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
const studentQuery = `
extend type Query {
    GetAllStudents: [Student]
    GetStudentById(_id: ID!): Student
}
`;

// *************** Student Mutation
const studentMutation = `
extend type Mutation{
    CreateStudent(
        student_input: StudentInput!): Student!

    UpdateStudent(
        _id:ID!,student_input: StudentInput!): Student

    DeleteStudent(
        _id: ID!): Student
}
`;

const studentTypeDefs = `
    ${studentType}
    ${studentQuery}
    ${studentMutation}
    ${studentAddressType}
`;
// *************** EXPORT MODULE ***************
module.exports = studentTypeDefs;
