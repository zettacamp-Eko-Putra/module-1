const DataLoader = require('dataloader');
const School = require('./school.models.js');
const keyBy = require('lodash/keyBy');

async function BatchSchool(schoolId){
    const schools = await School.find({ _id: { $in: schoolId } });
    const schoolMap = keyBy(schools, school => school._id.toString());
    return schoolId.map(id => schoolMap[id.toString()]);
}

function CreateSchoolLoader(){
    return new DataLoader(BatchSchool);
}

module.exports = CreateSchoolLoader;