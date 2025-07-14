// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Validates the school input object to ensure all required fields are present
 * and properly formatted. Throws an ApolloError if any validation rule is violated.
 *
 * @function ValidateSchoolInput
 * @param {Object} school_input - The school input data to validate.
 * @param {string} school_input.school_legal_name - Required. Must be a non-empty string.
 * @param {string} school_input.school_commercial_name - Required. Must be a non-empty string.
 * @param {Array<Object>} school_input.address - Required. Must contain at least one address object.
 * @param {string} school_input.address[].street - Required. Must be a non-empty string.
 * @param {string} school_input.address[].city - Required. Must be a non-empty string.
 * @param {string} school_input.address[].province - Required. Must be a non-empty string.
 * @param {string} school_input.address[].postal_code - Required. Must be a non-empty string.
 *
 * @throws {ApolloError} If any required field is missing or improperly formatted.
 */
function ValidateSchoolInput(schoolInput) {
  // *************** validate school school_legal_name
  if (
    !schoolInput.school_legal_name ||
    typeof schoolInput.school_legal_name !== 'string'
  ) {
    // *************** error message if the input not valid
    throw new ApolloError('school legal name is required and must be string');
  }

  // *************** validate if school school_legal_name has special character
  const specialRegexCharacter = /[^a-zA-Z0-9\s]/;
  if (specialRegexCharacter.test(schoolInput.school_legal_name)) {
    throw new ApolloError(
      `School legal name must not contain special character`
    );
  }

  // *************** validate school school_commercial_name
  if (
    !schoolInput.school_commercial_name ||
    typeof schoolInput.school_commercial_name !== 'string'
  ) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'school commercial name is required and must be string'
    );
  }

  // *************** validate school address
  if (!Array.isArray(schoolInput.address) || !schoolInput.address.length) {
    // *************** error message if the input not valid
    throw new ApolloError('Address is required.');
  }
  // *************** validate each address array
  schoolInput.address.forEach((addr, index) => {
    if (typeof addr.street !== 'string' || addr.street.trim() === '') {
      throw new ApolloError(`Street at index ${index} not valid`);
    }
    if (typeof addr.city !== 'string' || addr.city.trim() === '') {
      throw new ApolloError(`City at index ${index} not valid`);
    }
    if (typeof addr.province !== 'string' || addr.province.trim() === '') {
      throw new ApolloError(`Province at index ${index} not valid`);
    }
    if (
      typeof addr.postal_code !== 'string' ||
      addr.postal_code.trim() === ''
    ) {
      throw new ApolloError(`Postal code at index ${index} not valid`);
    }
  });
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateSchoolInput };
