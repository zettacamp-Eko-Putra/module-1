// *************** TYPE DEFINITION : School  ***************

// *************** School type
const schoolTypeDefs = `
    type SchoolAddress{
        street: String!
        city: String!
        province: String!
        postal_code: String!  
    }

    input SchoolAddressInput{
        street: String!
        city: String!
        province: String!
        postal_code: String!
    }

    type School {
        _id: ID!
        school_legal_name: String!
        school_commercial_name: String!
        address: [SchoolAddress]
        student: [ID]
        students: [Student]
        status:String!
        deleted_at:Date
    }

    input SchoolInput{
        _id:ID
        school_legal_name: String!
        school_commercial_name: String!
        address:[SchoolAddressInput]!
    }   

    extend type Query {
        GetAllSchools: [School]
        GetSchoolById(_id: ID!): School
    }

    extend type Mutation{
        CreateSchool(
          school_input: SchoolInput!): School!

        UpdateSchool(
          _id:ID!,school_input: SchoolInput!): School

        DeleteSchool(
          _id: ID!): School
    }
`;

// *************** EXPORT MODULE ***************
module.exports = schoolTypeDefs;
