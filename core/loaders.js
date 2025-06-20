// *************** IMPORT MODULE ***************
const CreateSchoolLoader = require('../modules/school/school.loader');
const CreateStudentLoader = require('../modules/student/student.loader');

/**
 * Creates and returns an object containing all configured DataLoaders
 * for batching and caching related data fetches.
 *
 * @function CreateLoaders
 * @returns {Object} - An object with DataLoader instances.
 * @returns {import('dataloader')} return.school - DataLoader for fetching schools by ID.
 * @returns {import('dataloader')} return.student - DataLoader for fetching students by ID.
 */
function GetDataLoaders() {
  return {
    school: CreateSchoolLoader(),
    student: CreateStudentLoader(),
  };
}

// *************** EXPORT MODULE ***************
module.exports = GetDataLoaders;
