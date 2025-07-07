// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

async function GetAllSubjects(_, args) {
  try {
    // *************** find subject data with status ACTIVE
    const activeSubjects = await SubjectModel.find({ status: 'ACTIVE' }).lean();

    // *************** returning subject data with status ACTIVE
    return activeSubjects;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

module.exports = {
  Query: {
    GetAllSubjects,
  },
};
