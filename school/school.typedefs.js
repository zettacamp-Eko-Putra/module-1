// *************** TYPE DEFINITION : School  ***************
const addressType =`
  type SchoolAddress{
    street: String!,
    city: String!,
    province: String!,
    postal_code: String!  
}`;

const schoolType = `

input SchoolAddressInput {
  street: String!
  city: String!
  province: String!
  postal_code: String!
}

  type School {
    id: ID!
    school_legal_name: String!
    school_commercial_name: String!
    address: [SchoolAddress]
    student: [ID]
    students: [Student]
    status:String!
    deleted_at:Date
  }

  input SchoolInput{
    id:ID
    school_legal_name: String!
    school_commercial_name: String!
    address:[SchoolAddressInput]!}
     
`;

const SchoolQuery = `
    extend type Query {
        GetAllSchool: [School]
        GetSchoolById(id: ID!): School
    }
`;

const SchoolMutation = `
  extend type Mutation{
    CreateSchool(
      schoolInput: SchoolInput!): School!

    UpdateSchool(
      id:ID!,schoolInput: SchoolInput!): School

    DeleteSchool(
      id: ID!): School
    }`

// *************** EXPORT MODULE ***************
module.exports = { schoolType,SchoolQuery, SchoolMutation, addressType };
