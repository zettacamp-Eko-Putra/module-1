// *************** TYPE DEFINITION : School  ***************
const addressType =`
  type Address{
    street: String!,
    city: String!,
    province: String!,
    postal_code: String!  
}`;

const schoolType = `

input AddressInput {
  street: String!
  city: String!
  province: String!
  postal_code: String!
}

  type School {
    id: ID!
    name: String!
    address: [Address]
    student: [ID]
    students: [Student]
    status:String!
    deleted_at:Date
  }

  input SchoolInput{
    id:ID
    name:String!
    address:[AddressInput]!}
     
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
    }`

// *************** EXPORT MODULE ***************
module.exports = { schoolType,SchoolQuery, SchoolMutation, addressType };
