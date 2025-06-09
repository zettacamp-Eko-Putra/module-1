// *************** TYPE DEFINITION : School  ***************
const addressType =`
  type Address{
    street: String!,
    city: String!,
    province: String!,
    postalCode: String!  
}`;

const schoolType = `
  type School {
    id: ID!
    name: String!
    address: [Address]
    students: [Student]
    status:String!
    deleted_at:Date
  }
     
`;

const SchoolQuery = `
    extend type Query {
        getAllSchool: [School]
        getSchoolById(id: ID!): School
    }
`;

const SchoolMutation = `
  extend type Mutation{
    createSchool(
      name:String!,
      address:[Address]): Student!
    }`

// *************** EXPORT MODULE ***************
module.exports = { schoolType,SchoolQuery, SchoolMutation, addressType };
