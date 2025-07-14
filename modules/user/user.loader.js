// *************** IMPORT LIBRARY ***************
const DataLoader = require('dataloader');
const KeyBy = require('lodash/keyBy');

// *************** IMPORT MODULE ***************
const UserModel = require('./user.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateArrayIdMongoose,
} = require(`../../utilities/common-validator/mongo-validator.js`);

/**
 * Batch function to load user data by a list of user IDs using DataLoader.
 * Validates the input IDs, queries the database, maps results by ID,
 * and returns them in the same order as the input, preserving null for missing users.
 *
 * @async
 * @function UserBatch
 * @param {string[]} user_ids - An array of MongoDB ObjectIds representing user IDs.
 * @returns {Promise<(Object|null)[]>} - A Promise that resolves to an array of user objects or nulls,
 *   in the same order as the input `user_ids`.
 *
 * @throws {ApolloError} - Throws an ApolloError if:
 * - Any of the IDs are invalid MongoDB ObjectIds.
 */
async function UserBatch(user_ids) {
  // *************** validate all user_ids
  ValidateArrayIdMongoose(user_ids, 'User Ids');

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

/**
 * Initializes a new DataLoader instance for batching and caching user data fetches.
 * Uses the `UserBatch` function to batch load user data by their IDs.
 *
 * @function UserLoader
 * @returns {DataLoader<string, Object|null>} - A DataLoader instance for user data.
 */
const UserLoader = () => {
  // *************** creating dataloader using batch UserBatch
  const loader = new DataLoader(UserBatch);

  // *************** return loader to user
  return loader;
};

// *************** EXPORT MODULE ***************
module.exports = UserLoader;
