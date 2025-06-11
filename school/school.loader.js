// *************** IMPORT MODULE *************** 
const DataLoader = require('dataloader');
const School = require('./school.models.js');
const keyBy = require('lodash/keyBy');

// *************** Batch School Data
async function SchoolBatch(schoolId){
    const schools = await School.find({ _id: { $in: schoolId } });
    const schoolMap = keyBy(schools, school => school._id.toString());
    return schoolId.map(id => schoolMap[id.toString()]);
}

// *************** Adding Loader
function CreateSchoolLoader(){
    return new DataLoader(SchoolBatch);
}

// *************** EXPORT MODULE *************** 
module.exports = CreateSchoolLoader;