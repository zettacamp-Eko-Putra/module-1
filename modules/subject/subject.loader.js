// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const KeyBy = require('lodash/keyBy');

// *************** IMPORT MODULE ***************
const SubjectModel = require('./subject.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require(`../../utilities/common-validator/mongo-validator.js`);

async function SubjectBatch(subjectIds) {
  // *************** validate all subjectIds
  ValidateArrayIdMongoose(subjectIds, 'subjectIds');

  // *************** find subject data based on id
  const subjects = await SubjectModel.find({
    _id: { $in: subjectIds },
  }).lean();

  // *************** create map from subject id
  const subjectMap = KeyBy(subjects, (subject) => String(subject._id));

  // *************** sort subject data and giving null if the data is empty
  const result = subjectIds.map((id) => subjectMap[String(id)] || null);

  // *************** return the data to user
  return result;
}

const SubjectLoader = () => {
  // *************** creating dataloader using batch SchoolBatch
  const loader = new DataLoader(SubjectBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = SubjectLoader;
