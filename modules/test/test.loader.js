// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const KeyBy = require('lodash/keyBy');

// *************** IMPORT MODULE ***************
const TestModel = require('./test.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require(`../../utilities/common-validator/mongo-validator.js`);

async function TestBatch(testIds) {
  // *************** validate all testids
  ValidateArrayIdMongoose(testIds, 'testIds');

  // *************** find test data based on id
  const tests = await TestModel.find({
    _id: { $in: testIds },
  }).lean();

  // *************** create map from test id
  const testMap = KeyBy(tests, (test) => String(test._id));

  // *************** sort test data and giving null if the data is empty
  const result = testIds.map((id) => testMap[String(id)] || null);

  // *************** return the data to user
  return result;
}

const TestLoader = () => {
  // *************** creating dataloader using batch TestBatch
  const loader = new DataLoader(TestBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = TestLoader;
