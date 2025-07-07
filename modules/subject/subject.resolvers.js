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

async function GetOneSubject(_, { _id }) {
  try {
    // *************** Validating Subject ID
    ValidateIdMongoose(_id, 'GetOneSubject');

    // *************** finding Subject based on id and status ACTIVE
    const subject = await SubjectModel.findOne({
      _id,
      status: 'ACTIVE',
    }).lean();

    // *************** showing message if the Subject cannot be found
    if (!subject) {
      throw new ApolloError('Subject Not Found');
    }

    // *************** returning subject data if Subject in database
    return subject;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

module.exports = {
  Query: {
    GetAllSubjects,
    GetOneSubject,
  },
};
