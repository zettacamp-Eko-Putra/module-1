// *************** IMPORT MODULE ***************
const BlockLoader = require('../modules/block/block.loader');
const SchoolLoader = require('../modules/school/school.loader');
const StudentLoader = require('../modules/student/student.loader');
const SubjectLoader = require('../modules/subject/subject.loader');
const TestLoader = require('../modules/test/test.loader');
const UserLoader = require('../modules/user/user.loader');

/**
 * Creates and returns an object containing all configured DataLoaders
 * for batching and caching related data fetches.
 *
 * @function CreateLoaders
 * @returns {Object} - An object with DataLoader instances.
 * @returns {import('dataloader')} return.school - DataLoader for fetching schools by ID.
 * @returns {import('dataloader')} return.student - DataLoader for fetching students by ID.
 */
function InitializeDataLoaders() {
  return {
    SchoolLoader: SchoolLoader(),
    StudentLoader: StudentLoader(),
    BlockLoader: BlockLoader(),
    SubjectLoader: SubjectLoader(),
    TestLoader: TestLoader(),
    UserLoader: UserLoader(),
  };
}

// *************** EXPORT MODULE ***************
module.exports = InitializeDataLoaders;
