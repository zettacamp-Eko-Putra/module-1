// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Validates the user input fields for creating or updating a user.
 *
 * Checks for required fields, data types, maximum lengths, valid enums,
 * valid email format, and array structure for address.
 *
 * @async
 * @function ValidateUserInput
 * @param {Object} userInput - The input object containing user details.
 * @param {string} userInput.first_name - First name of the user (required).
 * @param {string} userInput.last_name - Last name of the user (required).
 * @param {string} userInput.civility - Civility of the user (Mr or Mrs) (required).
 * @param {string} [userInput.office_phone] - Optional office phone (max 12 chars).
 * @param {string} [userInput.direct_line] - Optional direct line (max 12 chars).
 * @param {string} userInput.mobile_phone - Mobile phone (required, max 12 chars).
 * @param {string} userInput.entity - Entity type (ADMTC, Academic, Company) (required).
 * @param {Array<Object>} userInput.address - Array of address objects (required).
 * @param {string} userInput.address[].street - Street of the address (required).
 * @param {string} userInput.address[].city - City of the address (required).
 * @param {string} userInput.address[].province - Province of the address (required).
 * @param {string} userInput.address[].postal_code - Postal code of the address (required).
 * @param {string} userInput.email - Valid email address (required).
 * @param {string} userInput.password - Password (min. 6 characters) (required).
 * @param {string} userInput.role - Role of the user (required).
 *
 * @throws {ApolloError} If any of the validations fail.
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
