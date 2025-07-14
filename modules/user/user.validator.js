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
async function ValidateUserInput(userInput) {
  // *************** validate user first_name
  if (!userInput.first_name || typeof userInput.first_name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('first name is required and must be string');
  }

  // *************** validate user last_name
  if (!userInput.last_name || typeof userInput.last_name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('last name is required and must be string');
  }

  // *************** set value of civilities
  const civilities = ['Mr', 'Mrs'];
  // *************** validate user civility
  if (!userInput.civility || !civilities.includes(userInput.civility)) {
    // *************** error message if the input not valid
    throw new ApolloError(`Civility must be one of: ${civilities.join(', ')}`);
  }

  // *************** validate user office_phone
  if (userInput.office_phone && userInput.office_phone.length > 12) {
    // *************** error message if the input not valid
    throw new ApolloError('Office phone cannot exceed 12 characters.');
  }

  // *************** validate user direct_line
  if (userInput.direct_line && userInput.direct_line.length > 12) {
    // *************** error message if the input not valid
    throw new ApolloError('Direct line cannot exceed 12 characters.');
  }

  // *************** validate user mobile_phone
  if (!userInput.mobile_phone || userInput.mobile_phone.length > 12) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'Mobile phone is required and must not exceed 12 characters.'
    );
  }

  // *************** set value of entity
  const entities = ['ADMTC', 'Academic', 'Company'];
  // *************** validate user entitiy
  if (!userInput.entity || !entities.includes(userInput.entity)) {
    // *************** error message if the input not valid
    throw new ApolloError(`Entity must be one of: ${entities.join(', ')}`);
  }

  // *************** validate user address
  if (!Array.isArray(userInput.address) || !userInput.address.length) {
    // *************** error message if the input not valid
    throw new ApolloError('Address is required.');
  }
  // *************** validate each address array
  userInput.address.forEach((addr, index) => {
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
  if (!userInput.email || !emailRegex.test(userInput.email)) {
    // *************** error message if the input not valid
    throw new ApolloError('A valid email is required.');
  }

  // *************** validate user password
  if (!userInput.password || userInput.password.length < 6) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'Password is required and must be at least 6 characters.'
    );
  }

  // *************** validate user role
  if (!userInput.role || typeof userInput.role !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('Role is required.');
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateUserInput };
