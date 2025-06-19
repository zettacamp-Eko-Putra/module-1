// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

/**
 * Validates the student input object for required fields and proper data formats.
 * Throws an ApolloError if any validation rule is violated.
 *
 * @function ValidateStudentInput
 * @param {Object} student_input - The student input data to validate.
 * @param {string} student_input.first_name - Required. Must be a non-empty string.
 * @param {string} student_input.last_name - Required. Must be a non-empty string.
 * @param {string} student_input.civility - Required. Must be one of: "Mr", "Mrs".
 * @param {string} student_input.postal_code_of_birth - Required. Must be a non-empty string.
 * @param {string} student_input.mobile_phone - Required. Must not exceed 12 characters.
 * @param {Array<Object>} student_input.address - Required. Must contain at least one address object.
 * @param {string} student_input.address[].street - Required. Must be a non-empty string.
 * @param {string} student_input.address[].city - Required. Must be a non-empty string.
 * @param {string} student_input.address[].province - Required. Must be a non-empty string.
 * @param {string} student_input.address[].postal_code - Required. Must be a non-empty string.
 * @param {string} [student_input.date_of_birth] - Optional. If provided, must be a valid date string.
 * @param {string} student_input.school_id - Required. Must be a non-empty string.
 * @param {string} student_input.email - Required. Must be a valid email address.
 *
 * @throws {ApolloError} If any field fails validation.
 */
function ValidateStudentInput(student_input) {
  // *************** validate student first_name
  if (
    !student_input.first_name ||
    typeof student_input.first_name !== 'string'
  ) {
    // *************** error message if the input not valid
    throw new ApolloError('first name is required and must be string');
  }

  // *************** validate student last_name
  if (!student_input.last_name || typeof student_input.last_name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('last name is required and must be string');
  }

  // *************** validate student civility
  const civilities = ['Mr', 'Mrs'];
  if (!student_input.civility || !civilities.includes(student_input.civility)) {
    // *************** error message if the input not valid
    throw new ApolloError(`Civility must be one of: ${civilities.join(', ')}`);
  }

  // *************** validate student postal_code_of_birth
  if (
    !student_input.postal_code_of_birth ||
    typeof student_input.postal_code_of_birth !== 'string'
  ) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'postal code of birth is required and must be string'
    );
  }

  // *************** validate user mobile_phone
  if (!student_input.mobile_phone || student_input.mobile_phone.length > 12) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'Mobile phone is required and must not exceed 12 characters.'
    );
  }

  // *************** validate student address
  if (!Array.isArray(student_input.address) || !student_input.address.length) {
    // *************** error message if the input not valid
    throw new ApolloError('Address is required.');
  }
  // *************** validate each address array
  student_input.address.forEach((addr, index) => {
    if (typeof addr.street !== 'string' || addr.street.trim() === '') {
      throw new ApolloError(`Street at index ${index} not valid`);
    }
    if (typeof addr.city !== 'string' || addr.city.trim() === '') {
      throw new ApolloError(`city at index ${index} not valid`);
    }
    if (typeof addr.province !== 'string' || addr.province.trim() === '') {
      throw new ApolloError(`province at index ${index} not valid`);
    }
    if (
      typeof addr.postal_code !== 'string' ||
      addr.postal_code.trim() === ''
    ) {
      throw new ApolloError(`postal code at index ${index} not valid`);
    }
  });

  // *************** validate date_of_birth
  if (student_input.date_of_birth) {
    const date = new Date(student_input.date_of_birth);
    if (isNaN(date.getTime())) {
      // *************** error message if the input not valid
      throw new ApolloError('Date of birth must be a valid date.');
    }
  }

  // *************** validate school_id
  if (!student_input.school_id || typeof student_input.school_id !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('School ID is required and must be a string.');
  }

  // *************** validate student email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!student_input.email || !emailRegex.test(student_input.email)) {
    // *************** error message if the input not valid
    throw new ApolloError('A valid email is required.');
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateStudentInput };
