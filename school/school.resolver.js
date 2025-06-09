// *************** IMPORT MODULE *************** 
const School =  require('./school.model.js');
const schoolResolvers = {
  Query: {
    getAllSchool: () => {
    },
    getSchoolById: (_, { id }) => {
    }
  }
};

// *************** EXPORT MODULE ***************
module.exports = { schoolResolvers };