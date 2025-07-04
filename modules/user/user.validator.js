// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Validates the user input object for required fields and proper data formats.
 * Throws an ApolloError if any validation rule is violated.
 *
 * @function ValidateUserInput
 * @param {Object} user_input - The user input data to validate.
 * @param {string} user_input.first_name - Required. Must be a non-empty string.
 * @param {string} user_input.last_name - Required. Must be a non-empty string.
 * @param {string} user_input.civility - Required. Must be one of: "Mr", "Mrs".
 * @param {string} [user_input.office_phone] - Optional. Must not exceed 12 characters.
 * @param {string} [user_input.direct_line] - Optional. Must not exceed 12 characters.
 * @param {string} user_input.mobile_phone - Required. Must not exceed 12 characters.
 * @param {string} user_input.entity - Required. Must be one of: "ADMTC", "Academic", "Company".
 * @param {Array<Object>} user_input.address - Required. Must contain at least one address object.
 * @param {string} user_input.address[].street - Required. Street name.
 * @param {string} user_input.address[].city - Required. City name.
 * @param {string} user_input.address[].province - Required. Province name.
 * @param {string} user_input.address[].postal_code - Required. Postal code.
 * @param {string} user_input.email - Required. Must be a valid email format.
 * @param {string} user_input.password - Required. Must be at least 6 characters.
 * @param {string} user_input.role - Required. User role identifier.
 *
 * @throws {ApolloError} If any field fails validation.
 */
async function ValidateUserInput(user_input) {
  // *************** validate user first_name
  if (!user_input.first_name || typeof user_input.first_name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('first name is required and must be string');
  }

  // *************** validate user last_name
  if (!user_input.last_name || typeof user_input.last_name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('last name is required and must be string');
  }

  // *************** set value of civilities
  const civilities = ['Mr', 'Mrs'];
  // *************** validate user civility
  if (!user_input.civility || !civilities.includes(user_input.civility)) {
    // *************** error message if the input not valid
    throw new ApolloError(`Civility must be one of: ${civilities.join(', ')}`);
  }

  // *************** validate user office_phone
  if (user_input.office_phone && user_input.office_phone.length > 12) {
    // *************** error message if the input not valid
    throw new ApolloError('Office phone cannot exceed 12 characters.');
  }

  // *************** validate user direct_line
  if (user_input.direct_line && user_input.direct_line.length > 12) {
    // *************** error message if the input not valid
    throw new ApolloError('Direct line cannot exceed 12 characters.');
  }

  // *************** validate user mobile_phone
  if (!user_input.mobile_phone || user_input.mobile_phone.length > 12) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'Mobile phone is required and must not exceed 12 characters.'
    );
  }

  // *************** set value of entity
  const entities = ['ADMTC', 'Academic', 'Company'];
  // *************** validate user entitiy
  if (!user_input.entity || !entities.includes(user_input.entity)) {
    // *************** error message if the input not valid
    throw new ApolloError(`Entity must be one of: ${entities.join(', ')}`);
  }

  // *************** validate user address
  if (!Array.isArray(user_input.address) || !user_input.address.length) {
    // *************** error message if the input not valid
    throw new ApolloError('Address is required.');
  }
  // *************** validate each address array
  user_input.address.forEach((addr, index) => {
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
      throw new ApolloError(`Postal Code at index ${index} not valid`);
    }
  });

  // *************** validate user email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!user_input.email || !emailRegex.test(user_input.email)) {
    // *************** error message if the input not valid
    throw new ApolloError('A valid email is required.');
  }

  // *************** validate user password
  if (!user_input.password || user_input.password.length < 6) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'Password is required and must be at least 6 characters.'
    );
  }

  // *************** validate user role
  if (!user_input.role || typeof user_input.role !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('Role is required.');
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateUserInput };
