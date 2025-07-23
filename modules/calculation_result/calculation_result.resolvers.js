// *************** IMPORT LIBRARY ***************
const { Types } = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const CalculationResultModel = require('./calculation_result.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

// *************** GLOBAL VARIABLE ***************
const defaultUser = process.env.DEFAULT_USER_ID;

/**
 * Retrieves all calculation results with status 'ACTIVE'.
 *
 * This function queries the database for all entries in the CalculationResultModel
 * where the `status` is 'ACTIVE', then returns them as plain JavaScript objects using `.lean()`.
 *
 * @async
 * @function GetAllCalculationResults
 * @returns {Promise<Array<Object>>} Array of active calculation result documents.
 *
 * @throws {ApolloError} If there is an error during the database query.
 */
async function GetAllCalculationResults() {
  try {
    // *************** find calculation result data with status active
    const activeCalculationResults = await CalculationResultModel.find({
      status: 'ACTIVE',
    }).lean();

    // *************** returning calculation result data that has status "active"
    return activeCalculationResults;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Retrieves a single calculation result by its ID, only if its status is 'ACTIVE'.
 *
 * This function validates the provided ID, then queries the database for a
 * calculation result document with the given `_id` and `status: 'ACTIVE'`.
 * If the document is found, it is returned; otherwise, an error is thrown.
 *
 * @async
 * @function GetOneCalculationsResult
 * @param {Object} _ - Unused resolver root argument.
 * @param {Object} args - Resolver arguments.
 * @param {string} args._id - The ID of the calculation result to retrieve.
 * @returns {Promise<Object>} The active calculation result document.
 *
 * @throws {ApolloError} If the ID is invalid, the document is not found, or a database error occurs.
 */
async function GetOneCalculationResult(_, { _id }) {
  try {
    // *************** Validating calculation result ID
    ValidateIdMongoose(_id, '_id');

    // *************** finding calculation result based on id and status active
    const calculationResult = await CalculationResultModel.findOne({
      _id,
      status: 'ACTIVE',
    }).lean();

    // *************** showing message if the calculation result cannot be found
    if (!calculationResult) {
      throw new ApolloError('Calculation result Not Found');
    }

    // *************** returning calculation result data if calculation result in database
    return calculationResult;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

/**
 * Soft deletes a calculation result by updating its status to 'DELETED'.
 *
 * This function validates the provided `_id`, then finds the corresponding
 * active calculation result and updates its `status` to 'DELETED',
 * along with setting the `deleted_at` timestamp and `deleted_by` user.
 *
 * @async
 * @function DeleteCalculationResult
 * @param {Object} _ - Unused resolver root argument.
 * @param {Object} args - Resolver arguments.
 * @param {string} args._id - The ID of the calculation result to delete.
 * @returns {Promise<string>} The ID of the deleted calculation result.
 *
 * @throws {ApolloError} If the ID is invalid, the document is not found, already deleted, or a database error occurs.
 */
async function DeleteCalculationResult(_, { _id }) {
  try {
    // *************** Validating calculation result ID
    ValidateIdMongoose(_id, '_id');

    // *************** finding calculation result based on id and status and update the data
    const deleteCalculationResult =
      await CalculationResultModel.findOneAndUpdate(
        { _id, status: 'ACTIVE' },
        {
          // *************** changing status field to deleted and adding timestamp
          status: 'DELETED',
          deleted_at: new Date(),
          deleted_by: defaultUser,
        }
      )
        .select('_id')
        .lean();

    // *************** showing error message if calculation result already deleted
    if (!deleteCalculationResult) {
      throw new ApolloError('calculation result already deleted');
    }

    // *************** returning calculation result deleted data to user
    return _id;
  } catch (error) {
    // *************** Throw error message
    throw new ApolloError(error.message);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllCalculationResults,
    GetOneCalculationResult,
  },
  Mutation: {
    DeleteCalculationResult,
  },
};
