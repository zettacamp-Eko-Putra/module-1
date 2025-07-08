// *************** IMPORT MODULE ***************
const UserResolvers = require('../modules/user/user.resolvers');
const StudentResolvers = require('../modules/student/student.resolvers');
const SchoolResolvers = require('../modules/school/school.resolvers');
const BlockResolvers = require('../modules/block/block.resolvers');
const SubjectResolvers = require('../modules/subject/subject.resolvers');
const TestResolvers = require('../modules/test/test.resolvers');

// *************** Combine all resolver definitions
const resolvers = [
  UserResolvers,
  StudentResolvers,
  SchoolResolvers,
  BlockResolvers,
  SubjectResolvers,
  TestResolvers,
];

// *************** EXPORT MODULE ***************
module.exports = resolvers;
