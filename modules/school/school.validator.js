// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Utility function to validate input object for creating or updating a School.
 *
 * This function ensures that:
 * - `school_legal_name` exists, is a string, and contains no special characters.
 * - `school_commercial_name` exists and is a string.
 * - `address` is an array with at least one entry, and each entry contains valid
 *   `street`, `city`, `province`, and `postal_code` fields.
 *
 * @function ValidateSchoolInput
 * @param {Object} schoolInput - The input object for the School.
 * @param {string} schoolInput.school_legal_name - Legal name of the school.
 * @param {string} schoolInput.school_commercial_name - Commercial name of the school.
 * @param {Array<Object>} schoolInput.address - Array of address objects.
 * @param {string} schoolInput.address[].street - Street name of the address.
 * @param {string} schoolInput.address[].city - City name of the address.
 * @param {string} schoolInput.address[].province - Province name of the address.
 * @param {string} schoolInput.address[].postal_code - Postal code of the address.
 *
 * @throws {ApolloError} If any required field is missing or invalid.
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
