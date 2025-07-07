// *************** IMPORT MODULE ***************
const UserResolvers = require('../modules/user/user.resolvers');
const StudentResolvers = require('../modules/student/student.resolvers');
const SchoolResolvers = require('../modules/school/school.resolvers');
const BlockResolvers = require('../modules/block/block.resolvers');

// *************** Combine all resolver definitions
const resolvers = [
  UserResolvers,
  StudentResolvers,
  SchoolResolvers,
  BlockResolvers,
];

// *************** EXPORT MODULE ***************
module.exports = resolvers;
