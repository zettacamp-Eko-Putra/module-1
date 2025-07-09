// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const KeyBy = require('lodash/keyBy');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require(`../../utilities/common-validator/mongo-validator.js`);

async function UserBatch(user_ids) {
  // *************** validate all user_ids
  ValidateArrayIdMongoose(user_ids, 'userIds');

  // *************** find user data based on id
  const users = await UserModel.find({
    _id: { $in: user_ids },
  }).lean();

  // *************** create map from user id
  const usermap = KeyBy(users, (user) => String(user._id));

  // *************** sort user data and giving null if the data is empty
  const result = user_ids.map((id) => usermap[String(id)] || null);

  // *************** return the data to user
  return result;
}

const UserLoader = () => {
  // *************** creating dataloader using batch UserBatch
  const loader = new DataLoader(UserBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = UserLoader;
