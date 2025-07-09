// *************** IMPORT MODULE ***************
const UserResolvers = require('../modules/user/user.resolvers');
const StudentResolvers = require('../modules/student/student.resolvers');
const SchoolResolvers = require('../modules/school/school.resolvers');
const BlockResolvers = require('../modules/block/block.resolvers');
const SubjectResolvers = require('../modules/subject/subject.resolvers');
const TestResolvers = require('../modules/test/test.resolvers');
const student_test_resultResolvers = require('../modules/test_management/student_test_result/student_test_result.resolvers');
const taskResolvers = require('../modules/test_management/task/task.resolvers');

// *************** Combine all resolver definitions
const resolvers = [
  UserResolvers,
  StudentResolvers,
  SchoolResolvers,
  BlockResolvers,
  SubjectResolvers,
  TestResolvers,
  student_test_resultResolvers,
  taskResolvers
];

// *************** EXPORT MODULE ***************
module.exports = resolvers;
