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

// *************** EXPORT MODULE ***************
module.exports = {
  Query: {
    GetAllCalculationResults,
  },
};
