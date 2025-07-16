// *************** IMPORT LIBRARY ***************
const { Types } = require('mongoose');
const { ApolloError } = require('apollo-server');

// *************** IMPORT MODULE ***************
const CalculationResultModel = require('./calculation_result.models.js');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

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
async function GetOneCalculationsResult(_, { _id }) {
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

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllCalculationResults,
    GetOneCalculationsResult,
  },
};
