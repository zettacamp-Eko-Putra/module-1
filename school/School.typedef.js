// *************** TYPE DEFINITION : School  ***************
const schoolType = `
  type School {

    #School ID
    id: ID!

    #name of the school
    name: String!

    #address of the school
    address: String

    #student belong to the school
    students: [Student]
  }
     
`;

const SchoolQuery = `
    extend type Query {
        schools: [School]
        school(id: ID!): School
    }
`;

module.exports = { schoolType,SchoolQuery };
